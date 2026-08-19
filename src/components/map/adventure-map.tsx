"use client"

import { useId, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  MAP_SIZE,
  NORMANDIE_DEPARTEMENTS,
  REGIONS,
  SPOT_XY,
} from "@/lib/france-map"
import type { Adventure } from "@/lib/types"

const NORMANDIE_CODE = "28"
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)"
const DURATION = 700

type Anchor = "start" | "middle" | "end"

/**
 * Placement manuel des étiquettes, et léger décalage des pastilles trop
 * proches — la même liberté que prend une carte papier pour rester lisible.
 */
const MARKER_META: Record<
  string,
  {
    anchor: Anchor
    dx: number
    dy: number
    nudge?: [number, number]
    /** Nom abrégé quand celui de la commune déborde du cadre. */
    label?: string
  }
> = {
  "clecy-suisse-normande": { anchor: "middle", dx: 0, dy: -26 },
  "pont-douilly-oetre": { anchor: "start", dx: 24, dy: 16, nudge: [14, 16] },
  "les-andelys-seine": { anchor: "middle", dx: 0, dy: -26 },
  "etretat-albatre": { anchor: "start", dx: 24, dy: 5 },
  "baie-mont-saint-michel": { anchor: "start", dx: 24, dy: 5 },
  "vallee-de-leure": { anchor: "end", dx: -24, dy: 5 },
  "vire-souleuvre": { anchor: "end", dx: -24, dy: 5, label: "Vire" },
}

const DEFAULT_META = { anchor: "start" as Anchor, dx: 24, dy: 5 }

/** Cadrage cible sur la Normandie, calculé une fois depuis la bounding box. */
function useNormandieView() {
  return useMemo(() => {
    const normandie = REGIONS.find((r) => r.id === NORMANDIE_CODE)!
    const [[x0, y0], [x1, y1]] = normandie.bounds
    const scale =
      Math.min(MAP_SIZE.width / (x1 - x0), MAP_SIZE.height / (y1 - y0)) * 0.86
    const tx = MAP_SIZE.width / 2 - scale * ((x0 + x1) / 2)
    const ty = MAP_SIZE.height / 2 - scale * ((y0 + y1) / 2)
    return { normandie, scale, tx, ty }
  }, [])
}

type Props = {
  adventures: Adventure[]
  selectedSlug: string | null
  zoomed: boolean
  onSelect: (slug: string) => void
  onZoom: () => void
  className?: string
}

export function AdventureMap({
  adventures,
  selectedSlug,
  zoomed,
  onSelect,
  onZoom,
  className,
}: Props) {
  const uid = useId().replace(/:/g, "")
  const { normandie, scale, tx, ty } = useNormandieView()

  const groupTransform = zoomed
    ? `translate(${tx}px, ${ty}px) scale(${scale})`
    : "translate(0px, 0px) scale(1)"
  const transition = `transform ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}`

  /** Position écran d'un point, en unités du viewBox, quel que soit le zoom. */
  const project = (spotId: string, nudge?: [number, number]): [number, number] => {
    const [x, y] = SPOT_XY[spotId] ?? [0, 0]
    if (!zoomed) return [x, y]
    return [x * scale + tx + (nudge?.[0] ?? 0), y * scale + ty + (nudge?.[1] ?? 0)]
  }

  return (
    <div className={cn("relative isolate select-none overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 graph-paper" aria-hidden />

      <svg
        viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
        className="absolute inset-0 h-full w-full overflow-hidden"
        role="img"
        aria-label="Carte des parcours Traversia en Normandie"
      >
        <defs>
          {/* Hachures manuelles : la zone active se lit sans couleur. */}
          <pattern
            id={`hatch-${uid}`}
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="7"
              stroke="currentColor"
              strokeWidth="1.6"
              opacity="0.35"
            />
          </pattern>
          {/* Le fond cartographique ne doit jamais sortir du cadre au zoom. */}
          <clipPath id={`frame-${uid}`}>
            <rect x="0" y="0" width={MAP_SIZE.width} height={MAP_SIZE.height} />
          </clipPath>
        </defs>

        <g clipPath={`url(#frame-${uid})`}>
          {/* ---- Fond cartographique, seul élément qui bouge au zoom ---- */}
          <g style={{ transform: groupTransform, transformOrigin: "0 0", transition }}>
            {REGIONS.filter((r) => r.id !== NORMANDIE_CODE).map((r) => (
              <path
                key={r.id}
                d={r.d}
                className="fill-background stroke-hairline"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Remplissage seul : le contour est repassé après les limites
                départementales pour rester net. */}
            <path
              d={normandie.d}
              className={cn("text-foreground", !zoomed && "cursor-pointer")}
              fill={zoomed ? "var(--background)" : `url(#hatch-${uid})`}
              stroke="none"
              style={{ transition: `fill ${DURATION}ms ${EASE}` }}
              onClick={zoomed ? undefined : onZoom}
            />

            {/* Limites départementales, révélées seulement une fois zoomé. */}
            <g
              className="stroke-hairline fill-none"
              style={{ opacity: zoomed ? 1 : 0, transition }}
            >
              {NORMANDIE_DEPARTEMENTS.map((d) => (
                <path
                  key={d.id}
                  d={d.d}
                  strokeWidth={1}
                  strokeDasharray="3 4"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>

            <path
              d={normandie.d}
              className={cn(
                "pointer-events-none fill-none stroke-foreground",
              )}
              strokeWidth={2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {/* ---- Zone cliquable + cartouche de légende, vue France ---- */}
          <g
            style={{ opacity: zoomed ? 0 : 1, transition }}
            className={zoomed ? "pointer-events-none" : ""}
          >
            <path
              d={normandie.d}
              fill="transparent"
              className="cursor-pointer outline-none"
              onClick={onZoom}
              tabIndex={zoomed ? -1 : 0}
              role="button"
              aria-label="Zoomer sur la Normandie"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onZoom()
                }
              }}
            />
            {/* Ligne de rappel en L, qui passe sous le texte de la légende. */}
            <polyline
              points={`${normandie.centroid[0]},${normandie.centroid[1]} 210,132 60,132`}
              className="stroke-foreground"
              fill="none"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={normandie.centroid[0]}
              cy={normandie.centroid[1]}
              r={4}
              className="fill-foreground"
            />
            <g
              className="map-legend"
              style={{
                transform: "scale(var(--legend-scale))",
                transformOrigin: "60px 132px",
              }}
            >
              <text
                x={60}
                y={84}
                className="fill-foreground font-mono uppercase"
                fontSize={24}
                letterSpacing={5}
              >
                Normandie
              </text>
              <text
                x={60}
                y={116}
                className="fill-muted-foreground font-mono uppercase"
                fontSize={16}
                letterSpacing={3}
              >
                {adventures.length} parcours
              </text>
            </g>
          </g>

          {/* ---- Points de départ : taille constante, position animée ---- */}
          <g
            style={{ opacity: zoomed ? 1 : 0, transition }}
            className={zoomed ? "" : "pointer-events-none"}
          >
            {adventures.map((adventure, index) => {
              const meta = MARKER_META[adventure.spotId] ?? DEFAULT_META
              const [x, y] = project(adventure.spotId, meta.nudge)
              const active = adventure.slug === selectedSlug

              return (
                <g
                  key={adventure.slug}
                  style={{
                    transform: `translate(${x}px, ${y}px) scale(var(--marker-scale))`,
                    transformOrigin: "0 0",
                    transition,
                  }}
                  className="map-marker cursor-pointer outline-none"
                  role="button"
                  tabIndex={zoomed ? 0 : -1}
                  aria-label={`${adventure.title}, ${adventure.commune}`}
                  onClick={() => onSelect(adventure.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onSelect(adventure.slug)
                    }
                  }}
                >
                  {/* Cible tactile élargie, invisible. */}
                  <circle r={30} fill="transparent" />

                  {active && (
                    <circle
                      r={23}
                      className="fill-none stroke-foreground"
                      strokeWidth={1}
                      strokeDasharray="2 5"
                    />
                  )}
                  <circle
                    r={14}
                    className={cn(
                      "stroke-foreground transition-[fill] duration-300",
                      active ? "fill-foreground" : "fill-background",
                    )}
                    strokeWidth={1.5}
                  />
                  <text
                    y={4.5}
                    textAnchor="middle"
                    fontSize={13}
                    letterSpacing={0.5}
                    className={cn(
                      "pointer-events-none font-mono",
                      active ? "fill-background" : "fill-foreground",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </text>
                  {/* Halo blanc : le nom reste lisible par-dessus les traits. */}
                  <text
                    x={meta.dx}
                    y={meta.dy}
                    textAnchor={meta.anchor}
                    fontSize={16}
                    letterSpacing={2}
                    paintOrder="stroke"
                    stroke="var(--background)"
                    strokeWidth={5}
                    strokeLinejoin="round"
                    className={cn(
                      "pointer-events-none font-mono uppercase",
                      active ? "fill-foreground" : "fill-muted-foreground",
                    )}
                  >
                    {meta.label ?? adventure.commune}
                  </text>
                </g>
              )
            })}
          </g>
        </g>
      </svg>
    </div>
  )
}
