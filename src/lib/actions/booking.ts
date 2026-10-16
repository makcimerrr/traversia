"use server"

import { redirect } from "next/navigation"

import { BookingError, createBooking, previewDiscount } from "@/lib/bookings"
import { DiscountError } from "@/lib/discounts"
import { siteUrl } from "@/lib/site-url"

export type BookingFormState = {
  status: "idle" | "error"
  message?: string
  field?: string
  values?: Record<string, string>
}

const INT = (value: FormDataEntryValue | null, fallback = 0) => {
  const n = Number.parseInt(String(value ?? ""), 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

/**
 * Soumission du tunnel : valide, crée la réservation, puis redirige vers
 * Stripe (paiement) ou vers la page de suivi (demande sans paiement).
 */
export async function submitBooking(_prev: BookingFormState, formData: FormData): Promise<BookingFormState> {
  if (formData.get("site")) redirect("/")

  const values = Object.fromEntries(
    ["slotId", "adultes", "enfants", "prenom", "nom", "email", "telephone", "message", "code"].map((k) => [
      k,
      String(formData.get(k) ?? "").trim(),
    ]),
  )
  const fail = (message: string, field?: string): BookingFormState => ({ status: "error", message, field, values })

  if (!values.slotId) return fail("Choisissez une date.", "slot")
  const adultes = INT(values.adultes)
  const enfants = INT(values.enfants)
  if (adultes + enfants < 1) return fail("Indiquez au moins un participant.", "participants")
  if (values.prenom.length < 2) return fail("Indiquez votre prénom.", "prenom")
  if (values.nom.length < 2) return fail("Indiquez votre nom.", "nom")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return fail("Adresse e-mail invalide.", "email")
  if (!formData.get("cgv")) return fail("Merci d'accepter les conditions de vente.", "cgv")

  let outcome
  try {
    outcome = await createBooking(
      {
        slotId: values.slotId,
        adultes,
        enfants,
        prenom: values.prenom,
        nom: values.nom,
        email: values.email,
        telephone: values.telephone,
        message: values.message,
        newsletter: Boolean(formData.get("newsletter")),
        code: values.code || undefined,
      },
      await siteUrl(),
    )
  } catch (error) {
    if (error instanceof BookingError) return fail(error.message, error.field)
    console.error("[booking] Création impossible.", error)
    return fail("Nous n'avons pas pu enregistrer la réservation. Réessayez ou écrivez-nous.")
  }

  redirect(outcome.kind === "checkout" ? outcome.url : `/reservation/${outcome.reference}`)
}

export type CodePreview = { ok: true; libelle: string; montant: number; total: number } | { ok: false; message: string }

/** Vérifie un code promotionnel ou une carte cadeau et renvoie la remise. */
export async function previewCode(slotId: string, adultes: number, enfants: number, code: string): Promise<CodePreview> {
  try {
    const r = await previewDiscount(slotId, INT(String(adultes)), INT(String(enfants)), code)
    return { ok: true, ...r }
  } catch (error) {
    if (error instanceof DiscountError) return { ok: false, message: error.message }
    console.error("[booking] Vérification du code impossible.", error)
    return { ok: false, message: "Impossible de vérifier ce code pour l'instant." }
  }
}
