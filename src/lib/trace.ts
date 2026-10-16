import { SPOT_XY } from "./france-map"
import type { Adventure } from "./types"

/**
 * Tracé d'un parcours dans le repère de la carte (viewBox 1000 × 1000).
 *
 * Tant qu'aucune trace GPX n'est projetée, le tracé est schématique : une
 * boucle fermée qui part du point de rendez-vous, dont la longueur suit la
 * distance annoncée et dont la part randonnée / canoë respecte la fiche.
 * La partie à pied est anguleuse (crêtes), la partie sur l'eau ondule
 * (méandres). Le dessin est déterministe : même parcours, même tracé.
 */

export type Point = [number, number]

export type Tick = { at: Point; km: number; /** Normale unitaire, pour dessiner le trait perpendiculaire. */ n: Point }

export type Trace = {
  hike: Point[]
  canoe: Point[]
  /** Milieu de chaque segment, pour poser une étiquette. */
  hikeLabel: Point
  canoeLabel: Point
  /** Point de bascule : fin de la marche, mise à l'eau. */
  bascule: Point
  /** Repères kilométriques le long de la boucle, départ exclu. */
  ticks: Tick[]
  /** Intervalle des repères, en km. */
  tickEveryKm: number
  /** La rivière, qui déborde du tracé de part et d'autre. */
  river: Point[]
  /** Courbes de niveau schématiques autour de la crête. */
  contours: Point[][]
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

/** Une unité du viewBox vaut environ 1,1 km ; on dessine un peu plus large pour la lisibilité. */
export const UNITS_PER_KM = 1.1

function seeded(seed: string): () => number {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const cache = new Map<string, Trace>()

export function schematicTrace(adventure: Adventure): Trace {
  const cached = cache.get(adventure.slug)
  if (cached) return cached

  const rand = seeded(adventure.slug)
  const [sx, sy] = SPOT_XY[adventure.spotId] ?? [500, 500]
  const total = Math.max(adventure.stats.distanceKm, 6)
  const perimeter = total * UNITS_PER_KM
  const hikeShare = Math.min(0.85, Math.max(0.15, adventure.stats.randoKm / total))

  // Ellipse de même périmètre, aplatie et tournée au hasard.
  const base = perimeter / (2 * Math.PI)
  const flatten = 0.15 + rand() * 0.25
  const rx = base * (1 + flatten)
  const ry = base * (1 - flatten)
  const rotation = rand() * Math.PI
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)

  const point = (t: number, radial: number, lateral: number): Point => {
    const ex = rx * (1 + radial) * Math.cos(t)
    const ey = ry * (1 + radial) * Math.sin(t) + lateral
    return [ex * cos - ey * sin, ex * sin + ey * cos]
  }

  // Le point t = 0 est le rendez-vous : on recale la boucle dessus.
  const [ox, oy] = point(0, 0, 0)
  const shift = (p: Point): Point => [p[0] - ox + sx, p[1] - oy + sy]

  const N = 160
  const split = Math.round(N * hikeShare)
  const hike: Point[] = []
  const canoe: Point[] = []
  const phase = rand() * Math.PI * 2

  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2
    if (i <= split) {
      // Crêtes : bruit radial net, deux fréquences.
      const radial =
        0.06 * Math.sin(t * 7 + phase) + 0.04 * Math.sin(t * 13 + phase * 2) + (rand() - 0.5) * 0.03
      hike.push(shift(point(t, radial, 0)))
    }
    if (i >= split) {
      // Rivière : ondulation lente et régulière.
      const u = (i - split) / Math.max(1, N - split)
      const lateral = base * 0.09 * Math.sin(u * Math.PI * 5 + phase)
      canoe.push(shift(point(t, 0, lateral)))
    }
  }

  // Repères kilométriques : on marche le long de la boucle en cumulant la longueur.
  const loop = [...hike, ...canoe.slice(1)]
  const tickEveryKm = total > 30 ? 5 : total > 15 ? 2 : 1
  const ticks: Tick[] = []
  let walked = 0
  let nextKm = tickEveryKm
  for (let i = 1; i < loop.length; i++) {
    const [ax, ay] = loop[i - 1]
    const [bx, by] = loop[i]
    const seg = Math.hypot(bx - ax, by - ay)
    while (walked + seg >= nextKm * UNITS_PER_KM && nextKm < total) {
      const t = (nextKm * UNITS_PER_KM - walked) / seg
      const at: Point = [ax + (bx - ax) * t, ay + (by - ay) * t]
      const n: Point = seg > 0 ? [-(by - ay) / seg, (bx - ax) / seg] : [0, 1]
      ticks.push({ at, km: nextKm, n })
      nextKm += tickEveryKm
    }
    walked += seg
  }

  // La rivière prolonge le segment canoë aux deux bouts, en gardant sa direction.
  const extend = (from: Point, towards: Point, length: number, steps: number): Point[] => {
    const dx = from[0] - towards[0]
    const dy = from[1] - towards[1]
    const d = Math.hypot(dx, dy) || 1
    const [ux, uy] = [dx / d, dy / d]
    return Array.from({ length: steps }, (_, k) => {
      const t = ((k + 1) / steps) * length
      const wave = base * 0.07 * Math.sin(t / (base * 0.35) + phase)
      return [from[0] + ux * t - uy * wave, from[1] + uy * t + ux * wave] as Point
    })
  }
  const tail = base * 0.9
  const river: Point[] = [
    ...extend(canoe[0], canoe[Math.min(6, canoe.length - 1)], tail, 24).reverse(),
    ...canoe,
    ...extend(canoe[canoe.length - 1], canoe[Math.max(0, canoe.length - 7)], tail, 24),
  ]

  // Courbes de niveau : anneaux concentriques décalés vers l'extérieur de la crête.
  const crest = hike[Math.floor(hike.length / 2)]
  const cx = (Math.min(...hike.map((p) => p[0])) + Math.max(...hike.map((p) => p[0]))) / 2
  const cy = (Math.min(...hike.map((p) => p[1])) + Math.max(...hike.map((p) => p[1]))) / 2
  const away = Math.hypot(crest[0] - cx, crest[1] - cy) || 1
  const [ox2, oy2] = [(crest[0] - cx) / away, (crest[1] - cy) / away]
  const contours: Point[][] = [0.18, 0.32, 0.48, 0.66].map((k, ring) => {
    const r = base * k
    const centre: Point = [crest[0] + ox2 * base * 0.12, crest[1] + oy2 * base * 0.12]
    return Array.from({ length: 48 }, (_, i) => {
      const t = (i / 48) * Math.PI * 2
      const wobble = 1 + 0.08 * Math.sin(t * 3 + ring + phase) + 0.05 * Math.sin(t * 5 + phase)
      return [centre[0] + r * wobble * Math.cos(t) * 1.25, centre[1] + r * wobble * Math.sin(t) * 0.8] as Point
    })
  })

  const all = [...hike, ...canoe]
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  const pad = base * 0.35
  const trace: Trace = {
    hike,
    canoe,
    hikeLabel: hike[Math.floor(hike.length / 2)],
    canoeLabel: canoe[Math.floor(canoe.length / 2)],
    bascule: hike[hike.length - 1],
    ticks,
    tickEveryKm,
    river,
    contours,
    bbox: {
      x0: Math.min(...xs) - pad,
      y0: Math.min(...ys) - pad,
      x1: Math.max(...xs) + pad,
      y1: Math.max(...ys) + pad,
    },
  }
  cache.set(adventure.slug, trace)
  return trace
}

export function toPath(points: Point[], close = false): string {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + (close ? " Z" : "")
}

/** Point situé à une fraction (0–1) de la longueur d'une polyligne. */
export function pointAlong(points: Point[], fraction: number): Point {
  const lengths: number[] = [0]
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]))
  }
  const target = Math.max(0, Math.min(1, fraction)) * lengths[lengths.length - 1]
  for (let i = 1; i < points.length; i++) {
    if (lengths[i] >= target) {
      const seg = lengths[i] - lengths[i - 1] || 1
      const t = (target - lengths[i - 1]) / seg
      return [points[i - 1][0] + (points[i][0] - points[i - 1][0]) * t, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * t]
    }
  }
  return points[points.length - 1]
}

const WATER = /cano|kayak|pagaie|mise à l'eau|navigation|descente d|remontée|embarqu/i

/**
 * Étapes du programme posées le long de la boucle : celles d'avant la mise
 * à l'eau sur la partie à pied, la mise à l'eau à la bascule, les suivantes
 * sur la rivière. La dernière étape rejoint le départ (boucle fermée).
 */
export function placeSteps(
  trace: Trace,
  steps: { time: string; title: string; detail?: string }[],
): { at: Point; time: string; title: string; index: number }[] {
  if (steps.length === 0) return []
  const water = steps.findIndex((s) => WATER.test(`${s.title} ${s.detail ?? ""}`))
  const split = water >= 0 ? water : Math.ceil(steps.length / 2)
  const last = steps.length - 1
  return steps.map((step, index) => {
    if (index === 0) return { at: trace.hike[0], ...step, index }
    if (index === last) return { at: trace.canoe[trace.canoe.length - 1], ...step, index }
    if (index < split) return { at: pointAlong(trace.hike, index / split), ...step, index }
    if (index === split) return { at: trace.bascule, ...step, index }
    return { at: pointAlong(trace.canoe, (index - split) / (last - split)), ...step, index }
  })
}
