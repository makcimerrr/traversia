"use client"

import { useActionState } from "react"

import { cancelByCustomer, type CancelState } from "@/lib/actions/cancel"

const INITIAL: CancelState = { status: "idle" }

/** Annulation par le client : confirmation par son adresse e-mail. */
export function CancelForm({ reference, delai }: { reference: string; delai: number }) {
  const [state, action, pending] = useActionState(cancelByCustomer, INITIAL)

  if (state.status === "done") {
    return <p className="mt-3 max-w-md text-sm leading-relaxed">{state.message}</p>
  }

  return (
    <form action={action} className="mt-3 max-w-md">
      <input type="hidden" name="reference" value={reference} />
      <p className="text-sm leading-relaxed text-muted-foreground">
        Annulation gratuite et remboursement intégral jusqu&apos;à {delai} jours avant la date. Confirmez avec
        l&apos;adresse e-mail de la réservation.
      </p>
      <div className="mt-4 flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="votre@courriel.fr"
          className="w-full border border-border bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
        />
        <button
          type="submit"
          disabled={pending}
          onClick={(e) => {
            if (!window.confirm("Annuler définitivement cette réservation ?")) e.preventDefault()
          }}
          className="shrink-0 border border-border px-4 label-sm transition-colors hover:border-foreground disabled:opacity-40"
        >
          {pending ? "…" : "Annuler la réservation"}
        </button>
      </div>
      {state.status === "error" && <p className="mt-2 font-mono text-xs">{state.message}</p>}
    </form>
  )
}
