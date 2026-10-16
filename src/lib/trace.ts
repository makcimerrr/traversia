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

export type Trace = {
  hike: Point[]
  canoe: Point[]
  /** Milieu de chaque segment, pour poser une étiquette. */
  hikeLabel: Point
  canoeLabel: Point
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

/** Une unité du viewBox vaut environ 1,1 km ; on dessine un peu plus large pour la lisibilité. */
const UNITS_PER_KM = 1.1

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

  const all = [...hike, ...canoe]
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  const pad = base * 0.35
  const trace: Trace = {
    hike,
    canoe,
    hikeLabel: hike[Math.floor(hike.length / 2)],
    canoeLabel: canoe[Math.floor(canoe.length / 2)],
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

export function toPath(points: Point[]): string {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ")
}
