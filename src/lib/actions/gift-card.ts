"use server"

import { redirect } from "next/navigation"

import { createGiftCardOrder, GiftCardError } from "@/lib/gift-cards"
import { siteUrl } from "@/lib/site-url"

export type GiftCardFormState = { status: "idle" | "error"; message?: string; values?: Record<string, string> }

export async function submitGiftCard(_prev: GiftCardFormState, formData: FormData): Promise<GiftCardFormState> {
  if (formData.get("site")) redirect("/")
  const values = Object.fromEntries(
    ["montant", "montantLibre", "acheteurNom", "acheteurEmail", "beneficiaireNom", "beneficiaireEmail", "messagePerso"].map((k) => [
      k,
      String(formData.get(k) ?? "").trim(),
    ]),
  )
  const fail = (message: string): GiftCardFormState => ({ status: "error", message, values })
  const montant = values.montant === "libre" ? Number.parseFloat(values.montantLibre.replace(",", ".")) : Number.parseFloat(values.montant)
  if (!Number.isFinite(montant)) return fail("Choisissez un montant.")
  if (values.acheteurNom.length < 2) return fail("Indiquez votre nom.")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.acheteurEmail)) return fail("Votre adresse e-mail est invalide.")
  if (values.beneficiaireEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.beneficiaireEmail)) {
    return fail("L'adresse e-mail du bénéficiaire est invalide.")
  }
  if (!formData.get("cgv")) return fail("Merci d'accepter les conditions de vente.")

  let url: string
  try {
    ;({ url } = await createGiftCardOrder(
      {
        montant: Math.round(montant),
        acheteurNom: values.acheteurNom,
        acheteurEmail: values.acheteurEmail,
        beneficiaireNom: values.beneficiaireNom,
        beneficiaireEmail: values.beneficiaireEmail,
        messagePerso: values.messagePerso,
      },
      await siteUrl(),
    ))
  } catch (error) {
    if (error instanceof GiftCardError) return fail(error.message)
    console.error("[gift] Commande impossible.", error)
    return fail("Nous n'avons pas pu créer la commande. Réessayez ou écrivez-nous.")
  }
  redirect(url)
}
