import { cn } from "@/lib/utils"

const WIDTH = 800
const HEIGHT = 260
const SAMPLES = 160

/**
 * Profil altimétrique décoratif. La courbe est déterministe (aucun aléa),
 * donc identique côté serveur et côté client.
 */
function buildProfile() {
  const points: [number, number][] = []
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1)
    const h =
      0.42 +
      0.3 * Math.sin(t * Math.PI * 1.15) +
      0.11 * Math.sin(t * Math.PI * 4.3 + 0.9) +
      0.05 * Math.sin(t * Math.PI * 9.7 + 2.1) +
      0.025 * Math.sin(t * Math.PI * 21 + 0.4)
    points.push([t * WIDTH, HEIGHT - h * HEIGHT * 0.86])
  }
  return points
}

export function ElevationProfile({ className }: { className?: string }) {
  const points = buildProfile()
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`

  // Repères kilométriques du cartouche.
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn("h-full w-full", className)}
      aria-hidden
      focusable="false"
    >
      <defs>
        <pattern id="profile-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1.4" opacity="0.22" />
        </pattern>
      </defs>

      {/* Graduations horizontales. */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1="0"
          x2={WIDTH}
          y1={HEIGHT * g}
          y2={HEIGHT * g}
          className="stroke-hairline"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
      ))}

      <path d={area} fill="url(#profile-hatch)" className="text-foreground" />
      <path d={line} fill="none" className="stroke-foreground" strokeWidth="1.5" />

      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={t * WIDTH}
            x2={t * WIDTH}
            y1={HEIGHT - 10}
            y2={HEIGHT}
            className="stroke-foreground"
            strokeWidth="1"
          />
        </g>
      ))}
    </svg>
  )
}
