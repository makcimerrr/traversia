"use client"

import { useActionState, useState } from "react"

import { submitReview, type ReviewState } from "@/lib/actions/review"
import { cn } from "@/lib/utils"

const INITIAL: ReviewState = { status: "idle" }
const FIELD =
  "mt-2 w-full border border-border bg-transparent px-3.5 py-3 text-sm outline-none transition-colors focus:border-foreground"

export function ReviewForm({ reference }: { reference: string }) {
  const [state, action, pending] = useActionState(submitReview, INITIAL)
  const [note, setNote] = useState(5)

  if (state.status === "done") return <p className="mt-3 max-w-md text-sm leading-relaxed">{state.message}</p>

  return (
    <form action={action} noValidate className="mt-3 max-w-md space-y-4">
      <input type="hidden" name="reference" value={reference} />
      <input type="hidden" name="note" value={note} />
      <div className="flex gap-1" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={note === n}
            aria-label={`${n} sur 5`}
            onClick={() => setNote(n)}
            className={cn("size-9 border font-mono text-sm transition-colors", n <= note ? "border-foreground bg-foreground text-background" : "border-border")}
          >
            {n}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="label-sm text-muted-foreground">Votre avis</span>
        <textarea name="texte" rows={4} required className={cn(FIELD, "resize-y")} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label-sm text-muted-foreground">Signature (ex. Marion L.)</span>
          <input name="auteur" className={FIELD} />
        </label>
        <label className="block">
          <span className="label-sm text-muted-foreground">Courriel de la réservation</span>
          <input name="email" type="email" required className={FIELD} />
        </label>
      </div>
      {state.status === "error" && <p className="font-mono text-xs">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="border border-foreground px-5 py-3 label transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
      >
        {pending ? "…" : "Envoyer mon avis"}
      </button>
    </form>
  )
}
