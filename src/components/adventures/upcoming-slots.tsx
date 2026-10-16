import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { formatDateLong, formatMonth, formatPrice } from "@/lib/format"
import type { Adventure, Slot } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Prochaines dates d'une aventure, groupées par mois. Chaque ligne ouverte
 * mène au tunnel de réservation avec le créneau présélectionné.
 */
export function UpcomingSlots({
  adventure,
  slots,
  limit = 8,
  className,
}: {
  adventure: Adventure
  slots: Slot[]
  limit?: number
  className?: string
}) {
  const shown = slots.slice(0, limit)
  const months = [...new Set(shown.map((s) => s.date.slice(0, 7)))]

  if (shown.length === 0) {
    return (
      <div className={cn("border border-border p-6", className)}>
        <p className="label text-muted-foreground">Prochaines dates</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Aucune date n&apos;est ouverte pour l&apos;instant. Écrivez-nous pour être
          prévenu de l&apos;ouverture du calendrier ou organiser une sortie de groupe.
        </p>
        <Link
          href={`/contact?aventure=${adventure.slug}`}
          className="mt-6 inline-flex items-center gap-2 label link-underline"
        >
          Nous écrire
        </Link>
      </div>
    )
  }

  return (
    <div className={cn("border border-border", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <p className="label text-muted-foreground">Prochaines dates</p>
        <p className="label text-muted-foreground tabular-nums">
          {slots.length} {slots.length > 1 ? "créneaux" : "créneau"}
        </p>
      </div>

      {months.map((month) => (
        <div key={month}>
          <p className="border-b border-border bg-muted/40 px-5 py-2 label-sm text-muted-foreground">
            {formatMonth(`${month}-01`)}
          </p>
          <ul>
            {shown
              .filter((s) => s.date.startsWith(month))
              .map((slot) => {
                const full = slot.statut === "complet" || slot.placesRestantes === 0
                const lastPlaces = !full && slot.placesRestantes <= 3
                return (
                  <li key={slot.id} className="border-b border-border last:border-b-0">
                    {full ? (
                      <div className="grid gap-2 px-5 py-4 text-muted-foreground sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <div>
                          <p className="text-sm capitalize line-through">{formatDateLong(slot.date)}</p>
                          <p className="mt-1 label-sm">{slot.partnerName}</p>
                        </div>
                        <p className="label-sm">Complet</p>
                      </div>
                    ) : (
                      <Link
                        href={`/aventures/${adventure.slug}/reserver?creneau=${slot.id}`}
                        className="group grid gap-2 px-5 py-4 transition-colors hover:bg-foreground hover:text-background sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-6"
                      >
                        <div>
                          <p className="text-sm capitalize">{formatDateLong(slot.date)}</p>
                          <p className="mt-1 label-sm opacity-70">
                            {slot.heure && `${slot.heure} — `}
                            {slot.partnerName}
                          </p>
                        </div>
                        <p className={cn("label-sm tabular-nums", lastPlaces ? "" : "opacity-70")}>
                          {lastPlaces
                            ? `${slot.placesRestantes} ${slot.placesRestantes > 1 ? "dernières places" : "dernière place"}`
                            : `${slot.placesRestantes} places`}
                        </p>
                        <p className="flex items-center gap-2 font-mono text-sm tabular-nums">
                          {formatPrice(slot.prix)}
                          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </p>
                      </Link>
                    )}
                  </li>
                )
              })}
          </ul>
        </div>
      ))}

      {slots.length > shown.length && (
        <div className="border-t border-border px-5 py-3">
          <Link
            href={`/aventures/${adventure.slug}/reserver`}
            className="label link-underline"
          >
            Voir toutes les dates
          </Link>
        </div>
      )}
    </div>
  )
}
