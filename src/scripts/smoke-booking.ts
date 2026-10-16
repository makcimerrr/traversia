import { getPayload } from "payload"
import config from "../payload.config"

import { createBooking } from "../lib/bookings"
import { toSlot } from "../lib/content"

/**
 * Test de bout en bout du service de réservation, sans Stripe (mode demande) :
 * crée une réservation sur le premier créneau ouvert, vérifie que le stock
 * du créneau suit, puis supprime la réservation et vérifie la libération.
 * Usage : NODE_OPTIONS="--conditions=react-server" pnpm payload run src/scripts/smoke-booking.ts
 */
const payload = await getPayload({ config })
const log = (m: string) => payload.logger.info(m)

const { docs } = await payload.find({
  collection: "slots",
  where: { statut: { equals: "ouvert" } },
  sort: "date",
  limit: 20,
  depth: 1,
})
const slotDoc = docs.find((d) => d.places - (d.placesReservees ?? 0) >= 3)
if (!slotDoc) throw new Error("Aucun créneau ouvert avec trois places.")
const before = toSlot(slotDoc)!
log(`Créneau ${before.adventureSlug} ${before.date} : ${before.placesReservees}/${before.places} réservées`)

// Nettoyage d'un passage précédent, puis comptage des vraies réservations :
// le stock de démo n'est pas adossé à des réservations.
const stale = await payload.find({ collection: "bookings", where: { email: { equals: "test-smoke@example.com" } }, limit: 50 })
for (const b of stale.docs) await payload.delete({ collection: "bookings", id: b.id })
const realReserved = async () => {
  const { docs } = await payload.find({ collection: "bookings", where: { and: [{ slot: { equals: slotDoc.id } }, { statut: { in: ["en_attente", "demande", "confirmee"] } }] }, limit: 500, depth: 0 })
  return docs.reduce((n, b) => n + b.nbAdultes + b.nbEnfants, 0)
}
const reservedBefore = await realReserved()

const outcome = await createBooking(
  {
    slotId: String(slotDoc.id),
    adultes: 2,
    enfants: 1,
    prenom: "Test",
    nom: "Traversia",
    email: "test-smoke@example.com",
    telephone: "0600000000",
    message: "Réservation de test automatique.",
    newsletter: false,
  },
  "http://localhost:3000",
)
log(`Résultat : ${JSON.stringify(outcome)}`)

const after = toSlot(await payload.findByID({ collection: "slots", id: slotDoc.id, depth: 1 }))!
log(`Stock après création : ${after.placesReservees}/${after.places}`)
if (after.placesReservees !== reservedBefore + 3) throw new Error("Le stock n'a pas suivi la création.")

const booking = (
  await payload.find({ collection: "bookings", where: { reference: { equals: outcome.reference } }, limit: 1 })
).docs[0]
log(`Réservation ${booking.reference} — statut ${booking.statut} — total ${booking.montantTotal} €`)

// Tentative de sur-réservation : doit échouer proprement.
try {
  await createBooking(
    { slotId: String(slotDoc.id), adultes: 50, enfants: 0, prenom: "Trop", nom: "Nombreux", email: "x@example.com", telephone: "", message: "", newsletter: false },
    "http://localhost:3000",
  )
  throw new Error("La sur-réservation aurait dû échouer.")
} catch (error) {
  log(`Refus attendu : ${(error as Error).message}`)
}

await payload.delete({ collection: "bookings", id: booking.id })
const released = toSlot(await payload.findByID({ collection: "slots", id: slotDoc.id, depth: 1 }))!
log(`Stock après suppression : ${released.placesReservees}/${released.places}`)
if (released.placesReservees !== reservedBefore) throw new Error("Le stock n'a pas été libéré.")

const customer = (await payload.find({ collection: "customers", where: { email: { equals: "test-smoke@example.com" } }, limit: 1 })).docs[0]
if (customer) await payload.delete({ collection: "customers", id: customer.id })

log("Smoke test réservation : OK")
process.exit(0)
