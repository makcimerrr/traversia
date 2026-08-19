import { cn } from "@/lib/utils"
import type { Adventure } from "@/lib/types"

type Cell = { label: string; value: string }

export function statCells(a: Adventure): Cell[] {
  return [
    { label: "Distance", value: `${a.stats.distanceKm} km` },
    { label: "Dénivelé", value: `${a.stats.deniveleM} m D+` },
    { label: "Durée", value: a.stats.jours > 1 ? `${a.stats.jours} jours` : `${a.stats.dureeH} h` },
    { label: "Randonnée", value: `${a.stats.randoKm} km` },
    { label: "Canoë", value: `${a.stats.canoeKm} km` },
    { label: "Groupe", value: a.groupe.replace(" personnes", " pers.") },
  ]
}

/** Tableau de mesures façon cartouche de carte : filets fins, pas de fond. */
export function StatGrid({
  adventure,
  columns = 3,
  className,
}: {
  adventure: Adventure
  columns?: 2 | 3
  className?: string
}) {
  const cells = statCells(adventure)

  return (
    <dl
      className={cn(
        "grid border-t border-l border-border",
        columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2",
        className,
      )}
    >
      {cells.map((cell) => (
        <div key={cell.label} className="border-b border-r border-border px-3 py-2.5">
          <dt className="label-sm text-muted-foreground">{cell.label}</dt>
          <dd className="mt-1.5 font-mono text-sm tabular-nums">{cell.value}</dd>
        </div>
      ))}
    </dl>
  )
}
