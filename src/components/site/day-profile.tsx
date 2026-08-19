import { cn } from "@/lib/utils"

/**
 * Profil d'une journée type : le relief qu'on monte le matin, la rivière
 * qu'on descend l'après-midi. Convention des cartes anciennes — hachures
 * obliques pour le relief, hachures horizontales pour l'eau.
 */

/** Fraction de la journée où l'on quitte le sentier pour l'eau. */
const SPLIT = 0.647

/** Ligne de crête, en fraction de la hauteur utile. */
const RIDGE: [number, number][] = [
  [0, 0.12],
  [0.07, 0.26],
  [0.16, 0.33],
  [0.25, 0.7],
  [0.31, 0.86],
  [0.37, 0.64],
  [0.42, 0.76],
  [0.47, 0.6],
  [0.54, 0.38],
  [0.6, 0.27],
  [SPLIT, 0.2],
]

const HOURS: { at: number; time: string; label: string }[] = [
  { at: 0, time: "08h30", label: "Départ" },
  { at: 0.47, time: "12h30", label: "Déjeuner" },
  { at: SPLIT, time: "14h00", label: "Mise à l'eau" },
  { at: 1, time: "17h00", label: "Arrivée" },
]

/** Interpolation cosinus : une crête lisse, sans angle de spline. */
function heightAt(t: number): number {
  if (t >= SPLIT) return 0.2 + 0.007 * Math.sin(t * Math.PI * 34)

  let i = 0
  while (i < RIDGE.length - 2 && RIDGE[i + 1][0] < t) i++
  const [x0, y0] = RIDGE[i]
  const [x1, y1] = RIDGE[i + 1]
  const local = (t - x0) / (x1 - x0)
  const eased = (1 - Math.cos(local * Math.PI)) / 2
  const base = y0 + (y1 - y0) * eased
  return base + 0.016 * Math.sin(t * Math.PI * 21)
}

type Variant = "compact" | "wide"

const GEOMETRY: Record<Variant, { w: number; h: number; font: number; samples: number }> = {
  compact: { w: 700, h: 340, font: 18, samples: 180 },
  wide: { w: 1400, h: 300, font: 13, samples: 320 },
}

function Plate({ variant, className }: { variant: Variant; className?: string }) {
  const { w, h, font, samples } = GEOMETRY[variant]
  const top = 44
  const base = h - 58
  const span = base - top

  const y = (t: number) => base - heightAt(t) * span
  const points = Array.from({ length: samples + 1 }, (_, i) => {
    const t = i / samples
    return [t * w, y(t)] as const
  })

  const toPath = (from: number, to: number) =>
    points
      .filter(([x]) => x >= from - 0.001 && x <= to + 0.001)
      .map(([x, py], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${py.toFixed(1)}`)
      .join(" ")

  const splitX = SPLIT * w
  const trail = toPath(0, splitX)
  const river = toPath(splitX, w)

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Profil d'une journée : randonnée de 12,5 km le matin, 8,5 km de canoë l'après-midi"
    >
      <defs>
        <pattern
          id={`relief-${variant}`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        </pattern>
        {/* Hachures horizontales : la convention des cartes anciennes pour l'eau. */}
        <pattern id={`eau-${variant}`} width="11" height="5" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2.5" x2="7" y2="2.5" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />
        </pattern>
      </defs>

      <g className="text-foreground">
        {/* Remplissages : le relief, puis l'eau. */}
        <path
          d={`${trail} L${splitX},${base} L0,${base} Z`}
          fill={`url(#relief-${variant})`}
          className="profile-fill"
        />
        <path
          d={`${river} L${w},${base} L${splitX},${base} Z`}
          fill={`url(#eau-${variant})`}
          className="profile-fill"
        />
      </g>

      {/* Le tracé de la journée, d'un seul trait. */}
      <path
        d={`${trail} ${river.replace(/^M/, "L")}`}
        fill="none"
        className="stroke-foreground profile-trace"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Ligne de sol. */}
      <line x1="0" x2={w} y1={base} y2={base} className="stroke-foreground" strokeWidth="1" />

      {/* Rupture de discipline. */}
      <line
        x1={splitX}
        x2={splitX}
        y1={y(SPLIT)}
        y2={base + 14}
        className="stroke-hairline"
        strokeWidth="1"
        strokeDasharray="2 4"
      />

      {/* Étiquettes des deux moitiés. */}
      <text
        x={splitX / 2}
        y={top - 18}
        textAnchor="middle"
        fontSize={font}
        letterSpacing={font * 0.22}
        className="fill-muted-foreground font-mono uppercase"
      >
        Randonnée 12,5 km
      </text>
      <text
        x={splitX + (w - splitX) / 2}
        y={top - 18}
        textAnchor="middle"
        fontSize={font}
        letterSpacing={font * 0.22}
        className="fill-muted-foreground font-mono uppercase"
      >
        Canoë 8,5 km
      </text>

      {/* Axe des heures. */}
      {HOURS.map((hour, i) => {
        const x = hour.at * w
        const anchor = i === 0 ? "start" : i === HOURS.length - 1 ? "end" : "middle"
        return (
          <g key={hour.time}>
            <line x1={x} x2={x} y1={base} y2={base + 10} className="stroke-foreground" strokeWidth="1" />
            <text
              x={x}
              y={base + 10 + font * 2}
              textAnchor={anchor}
              fontSize={font}
              letterSpacing={font * 0.1}
              className="fill-foreground font-mono tabular-nums"
            >
              {hour.time}
            </text>
            <text
              x={x}
              y={base + 10 + font * 3.6}
              textAnchor={anchor}
              fontSize={font * 0.85}
              letterSpacing={font * 0.16}
              className="fill-muted-foreground font-mono uppercase"
            >
              {hour.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Deux tracés plutôt qu'un : le viewBox ne peut pas changer avec la largeur
 * d'écran, et un profil de 1400 unités rendrait les libellés illisibles sur
 * un téléphone.
 */
export function DayProfile({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Plate variant="compact" className="sm:hidden" />
      <Plate variant="wide" className="hidden sm:block" />
    </div>
  )
}
