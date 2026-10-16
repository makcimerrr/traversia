"use client"

import { useActionState } from "react"

import { activateAction, loginAction, requestLinkAction, type AccountState } from "@/lib/actions/account"
import { cn } from "@/lib/utils"

const INITIAL: AccountState = { status: "idle" }
const FIELD =
  "mt-2 w-full border border-border bg-transparent px-3.5 py-3 text-sm outline-none transition-colors focus:border-foreground"
const BUTTON =
  "inline-flex items-center gap-3 border border-foreground bg-foreground px-6 py-3.5 label text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, INITIAL)
  return (
    <form action={action} noValidate className="space-y-5">
      <label className="block">
        <span className="label-sm text-muted-foreground">Courriel</span>
        <input name="email" type="email" autoComplete="email" required className={FIELD} />
      </label>
      <label className="block">
        <span className="label-sm text-muted-foreground">Mot de passe</span>
        <input name="password" type="password" autoComplete="current-password" required className={FIELD} />
      </label>
      {state.status === "error" && <p className="font-mono text-xs">{state.message}</p>}
      <button type="submit" disabled={pending} className={BUTTON}>
        {pending ? "…" : "Se connecter"}
      </button>
    </form>
  )
}

export function RequestLinkForm() {
  const [state, action, pending] = useActionState(requestLinkAction, INITIAL)
  if (state.status === "done") return <p className="text-sm leading-relaxed text-muted-foreground">{state.message}</p>
  return (
    <form action={action} noValidate className="space-y-4">
      <label className="block">
        <span className="label-sm text-muted-foreground">Courriel de votre réservation</span>
        <input name="email" type="email" autoComplete="email" required className={FIELD} />
      </label>
      {state.status === "error" && <p className="font-mono text-xs">{state.message}</p>}
      <button type="submit" disabled={pending} className={cn(BUTTON, "border-border bg-transparent text-foreground hover:bg-foreground hover:text-background")}>
        {pending ? "…" : "Recevoir un lien"}
      </button>
    </form>
  )
}

export function ActivateForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(activateAction, INITIAL)
  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <label className="block">
        <span className="label-sm text-muted-foreground">Mot de passe (dix caractères minimum)</span>
        <input name="password" type="password" autoComplete="new-password" minLength={10} required className={FIELD} />
      </label>
      <label className="block">
        <span className="label-sm text-muted-foreground">Confirmer</span>
        <input name="confirm" type="password" autoComplete="new-password" required className={FIELD} />
      </label>
      {state.status === "error" && <p className="font-mono text-xs">{state.message}</p>}
      <button type="submit" disabled={pending} className={BUTTON}>
        {pending ? "…" : "Enregistrer et me connecter"}
      </button>
    </form>
  )
}
