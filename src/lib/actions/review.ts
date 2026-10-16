"use server"

import { getBookingByReference } from "@/lib/bookings"
import { toDateKey } from "@/lib/demo"
import { getPayloadClient } from "@/lib/payload"

export type ReviewState = { status: "idle" | "done" | "error"; message?: string }

/**
 * Avis déposé par un client depuis sa page de réservation, après la sortie.
 * L'avis est créé non publié : l'équipe le relit avant mise en ligne.
 */
export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const reference = String(formData.get("reference") ?? "")
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const note = Number.parseInt(String(formData.get("note") ?? ""), 10)
  const texte = String(formData.get("texte") ?? "").trim()
  const auteur = String(formData.get("auteur") ?? "").trim()

  const booking = await getBookingByReference(reference)
  if (!booking || booking.email.toLowerCase() !== email) {
    return { status: "error", message: "L'adresse e-mail ne correspond pas à cette réservation." }
  }
  if (booking.statut !== "confirmee" || booking.slot.date > toDateKey(new Date())) {
    return { status: "error", message: "L'avis se dépose après la sortie." }
  }
  if (!(note >= 1 && note <= 5)) return { status: "error", message: "Choisissez une note." }
  if (texte.length < 20) return { status: "error", message: "Quelques mots de plus ? Vingt caractères minimum." }

  try {
    const payload = await getPayloadClient()
    const already = await payload.find({
      collection: "reviews",
      where: { and: [{ email: { equals: email } }, { date: { equals: `${booking.slot.date}T12:00:00.000Z` } }] },
      limit: 1,
      depth: 0,
    })
    if (already.docs[0]) return { status: "done", message: "Votre avis a déjà été reçu, merci." }
    const adventure = await payload.find({ collection: "adventures", where: { slug: { equals: booking.adventure.slug } }, limit: 1, depth: 0 })
    await payload.create({
      collection: "reviews",
      data: {
        auteur: auteur || `${booking.prenom} ${booking.nom.charAt(0)}.`,
        note: String(note) as "1" | "2" | "3" | "4" | "5",
        texte,
        date: `${booking.slot.date}T12:00:00.000Z`,
        email,
        publie: false,
        adventure: adventure.docs[0]?.id,
      },
    })
    return { status: "done", message: "Merci. Votre avis sera publié après relecture." }
  } catch (error) {
    console.error("[review] Enregistrement impossible.", error)
    return { status: "error", message: "Nous n'avons pas pu enregistrer votre avis. Réessayez plus tard." }
  }
}
