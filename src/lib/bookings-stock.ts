import type { Payload, PayloadRequest } from "payload"

/** Statuts qui occupent des places sur un créneau. */
export const STOCK_STATUSES = ["en_attente", "demande", "confirmee"] as const

/**
 * Recalcule `placesReservees` d'un créneau à partir de ses réservations.
 * Appelé après chaque création, modification ou suppression de réservation.
 */
export async function syncSlotStock(
  payload: Payload,
  slotId: number | string | undefined | null,
  req?: PayloadRequest,
) {
  if (!slotId) return
  // `req` partage la transaction en cours : sans lui, la réservation qui
  // vient d'être écrite n'est pas encore visible.
  const { docs } = await payload.find({
    req,
    collection: "bookings",
    where: {
      and: [{ slot: { equals: slotId } }, { statut: { in: [...STOCK_STATUSES] } }],
    },
    limit: 1000,
    depth: 0,
    pagination: false,
  })
  const reserved = docs.reduce((sum, b) => sum + (b.nbAdultes ?? 0) + (b.nbEnfants ?? 0), 0)
  const slot = await payload.findByID({ collection: "slots", id: slotId, depth: 0, req })
  const statut =
    slot.statut === "complet" && reserved < slot.places
      ? "ouvert"
      : slot.statut === "ouvert" && reserved >= slot.places
        ? "complet"
        : slot.statut
  if (slot.placesReservees !== reserved || slot.statut !== statut) {
    await payload.update({
      req,
      collection: "slots",
      id: slotId,
      data: { placesReservees: reserved, statut },
      context: { skipRevalidate: true },
    })
  }
}
