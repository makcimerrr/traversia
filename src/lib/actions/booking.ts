"use server"

import { redirect } from "next/navigation"

import { BookingError, createBooking } from "@/lib/bookings"
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
    ["slotId", "adultes", "enfants", "prenom", "nom", "email", "telephone", "message"].map((k) => [
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
