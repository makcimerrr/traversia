"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { submitGiftCard, type GiftCardFormState } from "@/lib/actions/gift-card"
import { formatPrice } from "@/lib/format"
import { GIFT_CARD_AMOUNTS } from "@/lib/types"
import { cn } from "@/lib/utils"

const INITIAL: GiftCardFormState = { status: "idle" }
const FIELD =
  "mt-2 w-full border border-border bg-transparent px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"

export function GiftCardForm({ paymentEnabled, cancelled }: { paymentEnabled: boolean; cancelled?: boolean }) {
  const [state, action, pending] = useActionState(submitGiftCard, INITIAL)
  const v = state.values ?? {}
  const [montant, setMontant] = useState(v.montant || String(GIFT_CARD_AMOUNTS[1]))

  return (
    <form action={action} noValidate className="border border-border">
      <div className="border-b border-border px-5 py-4">
        <p className="label text-muted-foreground">Commander une carte cadeau</p>
      </div>
      <div className="space-y-8 p-5 sm:p-6">
        {cancelled && (
          <p className="border border-border px-4 py-3 text-sm text-muted-foreground">
            Le paiement a été interrompu. Rien n&apos;a été débité.
          </p>
        )}
        <fieldset>
          <legend className="label-sm text-muted-foreground">Montant</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {[...GIFT_CARD_AMOUNTS.map(String), "libre"].map((value) => (
              <label
                key={value}
                className={cn(
                  "cursor-pointer border px-4 py-3 font-mono text-sm tabular-nums transition-colors hover:border-foreground",
                  montant === value ? "border-foreground bg-foreground text-background" : "border-border",
                )}
              >
                <input type="radio" name="montant" value={value} checked={montant === value} onChange={() => setMontant(value)} className="sr-only" />
                {value === "libre" ? "Autre" : formatPrice(Number(value))}
              </label>
            ))}
          </div>
          {montant === "libre" && (
            <label className="mt-4 block max-w-xs">
              <span className="label-sm text-muted-foreground">Montant libre (20 à 1 000 €)</span>
              <input name="montantLibre" type="number" min={20} max={1000} step={1} defaultValue={v.montantLibre} className={FIELD} />
            </label>
          )}
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="label-sm text-muted-foreground">Votre nom</span>
            <input name="acheteurNom" defaultValue={v.acheteurNom} autoComplete="name" required className={FIELD} />
          </label>
          <label className="block">
            <span className="label-sm text-muted-foreground">Votre courriel</span>
            <input name="acheteurEmail" type="email" defaultValue={v.acheteurEmail} autoComplete="email" required className={FIELD} />
          </label>
          <label className="block">
            <span className="label-sm text-muted-foreground">Prénom du bénéficiaire (facultatif)</span>
            <input name="beneficiaireNom" defaultValue={v.beneficiaireNom} className={FIELD} />
          </label>
          <label className="block">
            <span className="label-sm text-muted-foreground">Courriel du bénéficiaire (facultatif)</span>
            <input name="beneficiaireEmail" type="email" defaultValue={v.beneficiaireEmail} className={FIELD} />
            <span className="mt-2 block label-sm text-muted-foreground">Renseigné, la carte lui est envoyée directement après paiement.</span>
          </label>
        </div>
        <label className="block">
          <span className="label-sm text-muted-foreground">Un mot pour accompagner la carte (facultatif)</span>
          <textarea name="messagePerso" rows={3} defaultValue={v.messagePerso} className={cn(FIELD, "resize-y")} />
        </label>
        <div className="hidden" aria-hidden>
          <label>
            Site web <input name="site" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="cgv" className="mt-1 size-3.5 accent-current" />
          <span>
            J&apos;accepte les{" "}
            <Link href="/cgv" target="_blank" className="link-underline">
              conditions de vente
            </Link>
            . La carte est valable un an à compter de l&apos;achat.
          </span>
        </label>
        {state.status === "error" && <p className="border border-foreground px-4 py-3 font-mono text-xs">{state.message}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-6">
        <p className="max-w-xs label-sm text-muted-foreground">
          {paymentEnabled ? "Paiement sécurisé par Stripe. Code envoyé immédiatement par e-mail." : "Le paiement en ligne arrive. En attendant, écrivez-nous pour commander."}
        </p>
        <button
          type="submit"
          disabled={pending || !paymentEnabled}
          className="inline-flex items-center gap-3 border border-foreground bg-foreground px-6 py-3.5 label text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
        >
          {pending ? "Un instant…" : "Payer la carte"}
        </button>
      </div>
    </form>
  )
}
