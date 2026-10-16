import "server-only"

import type { Payload } from "payload"

import { toAdventure, toSlot, getSettings } from "./content"
import { toDateKey } from "./demo"
import { adminBookingEmail, bookingConfirmationEmail, bookingRequestEmail, sendEmail } from "./email"
import { getPayloadClient, usePayload } from "./payload"
import { quote } from "./pricing"
import { getStripe, stripeEnabled } from "./stripe"
import type { Booking, BookingStatus } from "./types"
import type {
  Adventure as AdventureDoc,
  Booking as BookingDoc,
  Slot as SlotDoc,
} from "@/payload-types"

/**
 * Service de réservation : création, confirmation après paiement,
 * annulation d'une session expirée, lecture par référence.
 * Tout passe par l'API locale de Payload ; aucune route n'expose ces
 * fonctions sans vérification.
 */

export class BookingError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message)
  }
}

function toBooking(doc: BookingDoc): Booking | undefined {
  const slotDoc = typeof doc.slot === "object" ? doc.slot : undefined
  const adventureDoc = typeof doc.adventure === "object" ? doc.adventure : undefined
  if (!slotDoc || !adventureDoc) return undefined
  const slot = toSlot(slotDoc)
  if (!slot) return undefined
  return {
    id: String(doc.id),
    reference: doc.reference ?? "",
    statut: doc.statut,
    createdAt: doc.createdAt,
    adventure: toAdventure(adventureDoc),
    slot,
    nbAdultes: doc.nbAdultes,
    nbEnfants: doc.nbEnfants,
    prenom: doc.prenom,
    nom: doc.nom,
    email: doc.email,
    telephone: doc.telephone ?? "",
    message: doc.message ?? "",
    prixAdulte: doc.prixAdulte,
    prixEnfant: doc.prixEnfant ?? undefined,
    sousTotal: doc.sousTotal,
    remise: doc.remise ?? 0,
    remiseLibelle: doc.remiseLibelle ?? "",
    montantTotal: doc.montantTotal,
    payeLe: doc.payeLe ?? undefined,
    moyenPaiement: doc.moyenPaiement ?? undefined,
    stripeSessionId: doc.stripeSessionId ?? undefined,
    annuleLe: doc.annuleLe ?? undefined,
    montantRembourse: doc.montantRembourse ?? undefined,
  }
}

async function loadBooking(payload: Payload, id: number | string): Promise<Booking | undefined> {
  const doc = await payload.findByID({ collection: "bookings", id, depth: 2 })
  return toBooking(doc)
}

export async function getBookingByReference(reference: string): Promise<Booking | undefined> {
  if (!usePayload) return undefined
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: "bookings",
    where: { reference: { equals: reference } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ? toBooking(docs[0]) : undefined
}

// ----------------------------------------------------------------------------
// Création
// ----------------------------------------------------------------------------

export type BookingInput = {
  slotId: string
  adultes: number
  enfants: number
  prenom: string
  nom: string
  email: string
  telephone: string
  message: string
  newsletter: boolean
}

export type BookingOutcome =
  | { kind: "checkout"; url: string; reference: string }
  | { kind: "request"; reference: string }

/**
 * Crée la réservation puis, si Stripe est configuré, la session de
 * paiement. Sans Stripe, la réservation est enregistrée comme demande et
 * confirmée à la main depuis l'administration.
 */
export async function createBooking(input: BookingInput, siteUrl: string): Promise<BookingOutcome> {
  if (!usePayload) {
    throw new BookingError("La réservation en ligne n'est pas disponible sur cette version de démonstration.")
  }
  const payload = await getPayloadClient()

  const slotDoc = (await payload
    .findByID({ collection: "slots", id: input.slotId, depth: 1 })
    .catch(() => null)) as SlotDoc | null
  const slot = slotDoc ? toSlot(slotDoc) : undefined
  const adventureDoc = slotDoc && typeof slotDoc.adventure === "object" ? (slotDoc.adventure as AdventureDoc) : undefined
  if (!slotDoc || !slot || !adventureDoc) throw new BookingError("Ce créneau n'existe plus.", "slot")
  const adventure = toAdventure(adventureDoc)

  const participants = input.adultes + input.enfants
  if (slot.statut !== "ouvert") throw new BookingError("Ce créneau n'est plus ouvert à la réservation.", "slot")
  if (slot.date < toDateKey(new Date())) throw new BookingError("Cette date est passée.", "slot")
  if (participants < Math.max(1, adventure.minParticipants)) {
    throw new BookingError(`${adventure.minParticipants} participant${adventure.minParticipants > 1 ? "s" : ""} minimum.`, "participants")
  }
  if (participants > adventure.maxParticipants) {
    throw new BookingError(`${adventure.maxParticipants} participants maximum par réservation. Pour un groupe, écrivez-nous.`, "participants")
  }
  if (participants > slot.placesRestantes) {
    throw new BookingError(
      slot.placesRestantes > 0
        ? `Il ne reste que ${slot.placesRestantes} place${slot.placesRestantes > 1 ? "s" : ""} sur ce créneau.`
        : "Ce créneau est complet.",
      "participants",
    )
  }
  if (input.enfants > 0 && !adventure.prixEnfant && adventure.ageMin > adventure.ageEnfantMax) {
    throw new BookingError(`Ce parcours est ouvert à partir de ${adventure.ageMin} ans.`, "participants")
  }

  // Client : retrouvé par courriel, créé sinon.
  const existing = await payload.find({
    collection: "customers",
    where: { email: { equals: input.email.toLowerCase() } },
    limit: 1,
    depth: 0,
  })
  const customerData = {
    email: input.email.toLowerCase(),
    prenom: input.prenom,
    nom: input.nom,
    telephone: input.telephone || undefined,
    newsletter: input.newsletter || Boolean(existing.docs[0]?.newsletter),
  }
  const customer = existing.docs[0]
    ? await payload.update({ collection: "customers", id: existing.docs[0].id, data: customerData })
    : await payload.create({ collection: "customers", data: customerData })

  const q = quote(adventure, slot, input.adultes, input.enfants)
  const statut: BookingStatus = stripeEnabled ? "en_attente" : "demande"

  const created = await payload.create({
    collection: "bookings",
    data: {
      statut,
      slot: slotDoc.id,
      adventure: adventureDoc.id,
      partner: typeof slotDoc.partner === "object" ? slotDoc.partner.id : slotDoc.partner,
      customer: customer.id,
      nbAdultes: input.adultes,
      nbEnfants: input.enfants,
      prenom: input.prenom,
      nom: input.nom,
      email: input.email.toLowerCase(),
      telephone: input.telephone || undefined,
      message: input.message || undefined,
      prixAdulte: q.prixAdulte,
      prixEnfant: q.prixEnfant,
      sousTotal: q.sousTotal,
      remise: q.remise,
      remiseLibelle: q.remiseLibelle || undefined,
      montantTotal: q.total,
    },
  })
  const reference = created.reference!

  if (!stripeEnabled) {
    const booking = await loadBooking(payload, created.id)
    if (booking) await notifyRequest(booking, siteUrl)
    return { kind: "request", reference }
  }

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "fr",
    customer_email: input.email.toLowerCase(),
    client_reference_id: reference,
    metadata: { bookingId: String(created.id), reference },
    payment_intent_data: { description: `${adventure.title} — ${slot.date} — ${reference}` },
    line_items: q.lignes.map((line) => ({
      quantity: line.quantite,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(line.unitaire * 100),
        product_data: {
          name: `${adventure.title} — ${line.label}`,
          description: `${slot.date}${slot.heure ? ` · ${slot.heure}` : ""} · ${adventure.commune}`,
        },
      },
    })),
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${siteUrl}/reservation/${reference}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/aventures/${adventure.slug}/reserver?creneau=${slot.id}&annule=1`,
  })
  if (!session.url) throw new BookingError("Stripe n'a pas renvoyé de page de paiement.")

  await payload.update({
    collection: "bookings",
    id: created.id,
    data: { stripeSessionId: session.id },
    context: { skipRevalidate: true },
  })
  return { kind: "checkout", url: session.url, reference }
}

// ----------------------------------------------------------------------------
// Confirmation et annulation
// ----------------------------------------------------------------------------

async function notifyRequest(booking: Booking, siteUrl: string) {
  const settings = await getSettings()
  const mail = bookingRequestEmail(booking, settings, siteUrl)
  await sendEmail({ to: booking.email, replyTo: settings.email, ...mail })
  const admin = adminBookingEmail(booking, siteUrl)
  await sendEmail({ to: settings.email, replyTo: booking.email, ...admin })
}

/** Passe la réservation en « confirmée » et envoie l'e-mail de confirmation, une seule fois. */
export async function confirmBooking(
  bookingId: number | string,
  payment: { sessionId?: string; paymentIntentId?: string; method?: string },
  siteUrl: string,
): Promise<Booking | undefined> {
  const payload = await getPayloadClient()
  const current = await payload.findByID({ collection: "bookings", id: bookingId, depth: 0 })
  if (current.statut === "annulee" || current.statut === "remboursee") return loadBooking(payload, bookingId)

  const alreadyConfirmed = current.statut === "confirmee"
  if (!alreadyConfirmed) {
    await payload.update({
      collection: "bookings",
      id: bookingId,
      data: {
        statut: "confirmee",
        payeLe: new Date().toISOString(),
        stripeSessionId: payment.sessionId ?? current.stripeSessionId,
        stripePaymentIntentId: payment.paymentIntentId ?? current.stripePaymentIntentId,
        moyenPaiement: payment.method ?? current.moyenPaiement,
      },
    })
  }

  const booking = await loadBooking(payload, bookingId)
  if (booking && !current.confirmationEnvoyeeLe) {
    const settings = await getSettings()
    const mail = bookingConfirmationEmail(booking, settings, siteUrl)
    const sent = await sendEmail({ to: booking.email, replyTo: settings.email, ...mail })
    const admin = adminBookingEmail(booking, siteUrl)
    await sendEmail({ to: settings.email, replyTo: booking.email, ...admin })
    if (sent) {
      await payload.update({
        collection: "bookings",
        id: bookingId,
        data: { confirmationEnvoyeeLe: new Date().toISOString() },
        context: { skipRevalidate: true },
      })
    }
  }
  return booking
}

/** Session Stripe expirée sans paiement : la réservation libère ses places. */
export async function expireBooking(bookingId: number | string): Promise<void> {
  const payload = await getPayloadClient()
  const current = await payload.findByID({ collection: "bookings", id: bookingId, depth: 0 })
  if (current.statut !== "en_attente") return
  await payload.update({
    collection: "bookings",
    id: bookingId,
    data: { statut: "annulee", annuleLe: new Date().toISOString(), motifAnnulation: "Paiement non finalisé (session expirée)." },
  })
}

/** Remboursement constaté côté Stripe : on l'enregistre. */
export async function markRefunded(paymentIntentId: string, amountCents: number, refundId: string): Promise<void> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: "bookings",
    where: { stripePaymentIntentId: { equals: paymentIntentId } },
    limit: 1,
    depth: 0,
  })
  const booking = docs[0]
  if (!booking) return
  await payload.update({
    collection: "bookings",
    id: booking.id,
    data: {
      statut: "remboursee",
      annuleLe: booking.annuleLe ?? new Date().toISOString(),
      montantRembourse: amountCents / 100,
      stripeRefundId: refundId,
    },
  })
}

/**
 * Retour du client depuis Stripe : on vérifie la session sans attendre le
 * webhook, pour afficher la confirmation immédiatement.
 */
export async function reconcileCheckoutSession(reference: string, sessionId: string, siteUrl: string): Promise<Booking | undefined> {
  const booking = await getBookingByReference(reference)
  if (!booking) return undefined
  if (booking.statut !== "en_attente" || !stripeEnabled) return booking
  if (booking.stripeSessionId && booking.stripeSessionId !== sessionId) return booking
  const session = await getStripe().checkout.sessions.retrieve(sessionId)
  if (session.metadata?.reference !== reference) return booking
  if (session.payment_status === "paid") {
    return confirmBooking(booking.id, {
      sessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      method: session.payment_method_types?.[0],
    }, siteUrl)
  }
  return booking
}
