"use client"

import { useActionState } from "react"

import { MESSAGE_MOTIFS } from "@/lib/types"
import { sendContactMessage, type ContactState } from "@/lib/actions/contact"
import { cn } from "@/lib/utils"

const INITIAL: ContactState = { status: "idle" }

const FIELD =
  "mt-2 w-full border border-border bg-transparent px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"

export function ContactForm({
  adventures,
  defaultAdventure,
  defaultMotif,
}: {
  adventures: { slug: string; title: string }[]
  defaultAdventure?: string
  defaultMotif?: string
}) {
  const [state, action, pending] = useActionState(sendContactMessage, INITIAL)

  if (state.status === "success") {
    return (
      <div className="border border-border p-6 sm:p-8">
        <p className="label text-muted-foreground">Message envoyé</p>
        <h2 className="mt-4 text-3xl">Merci, c&apos;est bien reçu.</h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Nous répondons sous quarante-huit heures en saison, un peu plus longtemps l&apos;hiver.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="border border-border" noValidate>
      <div className="border-b border-border px-5 py-4">
        <p className="label text-muted-foreground">Formulaire</p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <fieldset>
          <legend className="label-sm text-muted-foreground">Motif</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {MESSAGE_MOTIFS.map((motif, i) => (
              <label
                key={motif.value}
                className="cursor-pointer border border-border px-3.5 py-2.5 label-sm transition-colors has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background hover:border-foreground"
              >
                <input
                  type="radio"
                  name="motif"
                  value={motif.value}
                  className="sr-only"
                  defaultChecked={defaultMotif ? motif.value === defaultMotif : i === 0}
                />
                {motif.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="label-sm text-muted-foreground">Nom</span>
            <input name="nom" type="text" autoComplete="name" required className={FIELD} />
            {state.errors?.nom && <Error>{state.errors.nom}</Error>}
          </label>
          <label className="block">
            <span className="label-sm text-muted-foreground">Courriel</span>
            <input name="email" type="email" autoComplete="email" required className={FIELD} />
            {state.errors?.email && <Error>{state.errors.email}</Error>}
          </label>
          <label className="block">
            <span className="label-sm text-muted-foreground">Téléphone (facultatif)</span>
            <input name="telephone" type="tel" autoComplete="tel" className={FIELD} />
          </label>
          <label className="block">
            <span className="label-sm text-muted-foreground">Aventure concernée</span>
            <select name="aventure" defaultValue={defaultAdventure ?? ""} className={cn(FIELD, "appearance-none")}>
              <option value="">— Aucune en particulier —</option>
              {adventures.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="label-sm text-muted-foreground">Message</span>
          <textarea name="message" rows={6} required className={cn(FIELD, "resize-y")} />
          {state.errors?.message && <Error>{state.errors.message}</Error>}
        </label>

        {/* Champ piège, invisible pour les humains. */}
        <div className="hidden" aria-hidden>
          <label>
            Site web <input name="site" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {state.message && <Error>{state.message}</Error>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-6">
        <p className="max-w-xs label-sm text-muted-foreground">
          Vos coordonnées servent uniquement à vous répondre.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-3 border border-foreground bg-foreground px-6 py-3.5 label text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
        >
          {pending ? "Envoi…" : "Envoyer"}
        </button>
      </div>
    </form>
  )
}

function Error({ children }: { children: React.ReactNode }) {
  return <span className="mt-2 block font-mono text-xs text-foreground">{children}</span>
}
