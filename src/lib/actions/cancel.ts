"use server"

import { revalidatePath } from "next/cache"

import { BookingError, cancelBooking, daysUntil, getBookingByReference } from "@/lib/bookings"
import { getSettings } from "@/lib/content"
import { siteUrl } from "@/lib/site-url"

export type CancelState = { status: "idle" | "done" | "error"; message?: string }

/**
 * Annulation par le client depuis sa page de réservation : gratuite et
 * remboursée intégralement jusqu'au délai fixé dans les paramètres.
 * Au-delà, le client est invité à écrire.
 */
export async function cancelByCustomer(_prev: CancelState, formData: FormData): Promise<CancelState> {
  const reference = String(formData.get("reference") ?? "")
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const booking = await getBookingByReference(reference)
  if (!booking || booking.email.toLowerCase() !== email) {
    return { status: "error", message: "L'adresse e-mail ne correspond pas à cette réservation." }
  }
  const settings = await getSettings()
  if (daysUntil(booking.slot.date) < settings.delaiAnnulationJours) {
    return {
      status: "error",
      message: `Le délai d'annulation gratuite (${settings.delaiAnnulationJours} jours) est dépassé. Écrivez-nous à ${settings.email}.`,
    }
  }
  try {
    await cancelBooking(booking.id, {
      rembourser: true,
      motif: "Annulation à votre demande, dans le délai d'annulation gratuite.",
      origine: "client",
      siteUrl: await siteUrl(),
    })
  } catch (error) {
    if (error instanceof BookingError) return { status: "error", message: error.message }
    console.error("[cancel] Annulation impossible.", error)
    return { status: "error", message: `Nous n'avons pas pu annuler automatiquement. Écrivez-nous à ${settings.email}.` }
  }
  revalidatePath(`/reservation/${reference}`)
  return { status: "done", message: "Réservation annulée. Un e-mail de confirmation vous est envoyé." }
}
