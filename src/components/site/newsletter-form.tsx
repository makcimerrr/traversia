"use client"

import { useActionState } from "react"

import { subscribeNewsletter, type NewsletterState } from "@/lib/actions/newsletter"

const INITIAL: NewsletterState = { status: "idle" }

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, INITIAL)

  if (state.status === "done") {
    return <p className="text-sm leading-relaxed text-muted-foreground">{state.message}</p>
  }

  return (
    <form action={action} noValidate>
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="votre@courriel.fr"
          aria-label="Courriel"
          className="w-full border border-border bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 border border-foreground px-4 label-sm transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          {pending ? "…" : "S'inscrire"}
        </button>
      </div>
      <div className="hidden" aria-hidden>
        <label>
          Site web <input name="site" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.status === "error" && <p className="mt-2 font-mono text-xs">{state.message}</p>}
      <p className="mt-3 label-sm text-muted-foreground">Nouvelles dates et nouveaux parcours. Désinscription en un clic.</p>
    </form>
  )
}
