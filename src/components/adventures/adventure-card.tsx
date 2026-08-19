import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Adventure } from "@/lib/types"
import { DifficultyMeter } from "./difficulty-meter"
import { StatGrid } from "./stat-grid"

/**
 * Fiche de parcours, dessinée comme une carte d'itinéraire :
 * en-tête chiffré, titre en serif, cartouche de mesures, pied de page.
 */
export function AdventureCard({
  adventure,
  index,
  active = false,
  className,
}: {
  adventure: Adventure
  index: number
  active?: boolean
  className?: string
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col border bg-card transition-colors duration-300",
        active ? "border-foreground" : "border-border",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <span className="label text-muted-foreground">
          {String(index + 1).padStart(2, "0")} — {adventure.departement}
        </span>
        <DifficultyMeter value={adventure.difficulty} showLabel={false} />
      </header>

      <div className="flex flex-1 flex-col px-5 pt-5">
        <p className="label-sm text-muted-foreground">{adventure.commune}</p>
        <h3 className="mt-2.5 text-3xl leading-[1.05] sm:text-[2.1rem]">
          {adventure.title}
        </h3>
        <p className="mt-3 font-display text-lg italic leading-snug text-muted-foreground sm:min-h-[3.5rem]">
          {adventure.tagline}
        </p>

        <div className="rule my-5" />

        <StatGrid adventure={adventure} columns={3} />

        <ul className="mt-5 space-y-2">
          {adventure.temps_forts.map((point) => (
            <li key={point} className="flex gap-3 text-sm leading-snug">
              <span aria-hidden className="mt-[0.45em] size-1 shrink-0 bg-foreground" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="flex-1" />
      </div>

      <footer className="mt-6 flex items-center justify-between gap-4 border-t border-border px-5 py-4">
        <div>
          <p className="label-sm text-muted-foreground">À partir de</p>
          <p className="mt-1.5 font-mono text-sm tabular-nums">
            {adventure.prix} € / pers.
          </p>
        </div>
        <Link
          href={`/aventures/${adventure.slug}`}
          className="group inline-flex items-center gap-2 border border-foreground px-4 py-2.5 label transition-colors hover:bg-foreground hover:text-background"
        >
          Le parcours
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </footer>
    </article>
  )
}
