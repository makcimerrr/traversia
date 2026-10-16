import { formatDateShort } from "@/lib/format"
import type { Review } from "@/lib/types"
import { cn } from "@/lib/utils"

function Stars({ note }: { note: Review["note"] }) {
  return (
    <span className="font-mono text-xs tracking-[0.2em]" aria-label={`${note} sur 5`}>
      {"●".repeat(note)}
      <span className="text-border">{"●".repeat(5 - note)}</span>
    </span>
  )
}

export function Reviews({ reviews, className }: { reviews: Review[]; className?: string }) {
  if (reviews.length === 0) return null
  const average = reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="label text-muted-foreground">
          {reviews.length} {reviews.length > 1 ? "avis" : "avis"}
        </p>
        <p className="flex items-center gap-3 font-mono text-sm tabular-nums">
          {average.toFixed(1).replace(".", ",")} / 5
          <Stars note={Math.round(average) as Review["note"]} />
        </p>
      </div>
      <ul className="mt-6 grid gap-px border border-border bg-border md:grid-cols-2">
        {reviews.map((review) => (
          <li key={review.id} className={cn("flex flex-col bg-background p-6")}>
            <Stars note={review.note} />
            <p className="mt-4 flex-1 text-sm leading-relaxed">{review.texte}</p>
            <footer className="mt-5 flex items-center justify-between gap-4 label-sm text-muted-foreground">
              <span>{review.auteur}</span>
              <span className="tabular-nums">{formatDateShort(review.date)}</span>
            </footer>
          </li>
        ))}
      </ul>
    </div>
  )
}
