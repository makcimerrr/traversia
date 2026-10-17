import { getPayload } from "payload"
import config from "../payload.config"

import { confirmBooking, createBooking } from "../lib/bookings"

/**
 * Crée (ou remet à neuf) un compte client de démonstration avec un mot de
 * passe connu et une réservation confirmée, pour tester l'application mobile.
 * Usage : pnpm test:account [email] [mot de passe]
 */
const email = (process.argv[2] ?? "demo@traversia.fr").toLowerCase()
const password = process.argv[3] ?? "Traversia2026!"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://traversia.vercel.app"

const payload = await getPayload({ config })
const log = (m: string) => payload.logger.info(m)

// Compte : créé ou mis à jour, mot de passe forcé, activé.
const existing = await payload.find({ collection: "customers", where: { email: { equals: email } }, limit: 1, depth: 0 })
const base = { email, password, prenom: "Démo", nom: "Traversia", compteActiveLe: new Date().toISOString() }
const customer = existing.docs[0]
  ? await payload.update({ collection: "customers", id: existing.docs[0].id, data: base })
  : await payload.create({ collection: "customers", data: base })
log(`Compte ${customer.email} (#${customer.id}) prêt`)

// Réservation confirmée : une seule, sur le premier créneau ouvert à venir.
const bookings = await payload.find({
  collection: "bookings",
  where: { and: [{ customer: { equals: customer.id } }, { statut: { equals: "confirmee" } }] },
  limit: 1,
  depth: 0,
})
if (bookings.docs[0]) {
  log(`Réservation existante ${bookings.docs[0].reference}, rien à créer`)
} else {
  const { docs } = await payload.find({ collection: "slots", where: { statut: { equals: "ouvert" } }, sort: "date", limit: 20, depth: 1 })
  const slot = docs.find((d) => d.places - (d.placesReservees ?? 0) >= 2)
  if (!slot) throw new Error("Aucun créneau ouvert avec deux places.")
  const outcome = await createBooking(
    { slotId: String(slot.id), adultes: 2, enfants: 0, prenom: "Démo", nom: "Traversia", email, telephone: "0600000000", message: "", newsletter: false },
    siteUrl,
  )
  const created = (await payload.find({ collection: "bookings", where: { reference: { equals: outcome.reference } }, limit: 1, depth: 0 })).docs[0]
  const confirmed = await confirmBooking(created.id, { method: "test" }, siteUrl)
  log(`Réservation ${confirmed?.reference} confirmée (${confirmed?.statut}), facture ${confirmed?.numeroFacture ?? "—"}`)
}

// Vérification : la connexion fonctionne avec ces identifiants.
const login = await payload.login({ collection: "customers", data: { email, password } })
log(`Connexion vérifiée pour ${login.user.email}`)
process.exit(0)
