import "server-only"

import type { Payload } from "payload"

import { toAdventure, toSlot, getSettings } from "./content"
import { issueActivationUrl } from "./customer-account"
import { toDateKey } from "./demo"
import { DiscountError, resolveDiscount, type Discount } from "./discounts"
import {
  adminBookingEmail,
  bookingCancellationEmail,
  bookingConfirmationEmail,
  bookingRequestEmail,
  sendEmail,
} from "./email"
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
    montantCarteCadeau: doc.montantCarteCadeau ?? 0,
    numeroFacture: doc.numeroFacture ?? undefined,
    factureEmiseLe: doc.factureEmiseLe ?? undefined,
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
  /** Code promotionnel ou carte cadeau, facultatif. */
  code?: string
}

export type BookingOutcome =
  | { kind: "checkout"; url: string; reference: string }
  | { kind: "request"; reference: string }
  | { kind: "confirmed"; reference: string }

/** Aperçu d'une remise pour le tunnel, avant soumission. */
export async function previewDiscount(
  slotId: string,
  adultes: number,
  enfants: number,
  code: string,
): Promise<{ libelle: string; montant: number; total: number }> {
  if (!usePayload) throw new DiscountError("Les codes ne sont pas disponibles en démonstration.")
  const payload = await getPayloadClient()
  const slotDoc = (await payload.findByID({ collection: "slots", id: slotId, depth: 1 }).catch(() => null)) as SlotDoc | null
  const slot = slotDoc ? toSlot(slotDoc) : undefined
  const adventureDoc = slotDoc && typeof slotDoc.adventure === "object" ? (slotDoc.adventure as AdventureDoc) : undefined
  if (!slot || !adventureDoc) throw new DiscountError("Choisissez d'abord une date.")
  const base = quote(toAdventure(adventureDoc), slot, adultes, enfants)
  const discount = await resolveDiscount(payload, code, { sousTotal: base.sousTotal, adventureId: adventureDoc.id })
  return { libelle: discount.libelle, montant: discount.montant, total: Math.max(0, base.sousTotal - discount.montant) }
}

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

  const base = quote(adventure, slot, input.adultes, input.enfants)
  let discount: Discount | undefined
  if (input.code?.trim()) {
    try {
      discount = await resolveDiscount(payload, input.code, { sousTotal: base.sousTotal, adventureId: adventureDoc.id })
    } catch (error) {
      if (error instanceof DiscountError) throw new BookingError(error.message, "code")
      throw error
    }
  }
  const q = quote(adventure, slot, input.adultes, input.enfants, discount ? { montant: discount.montant, libelle: discount.libelle } : undefined)
  const paidByGift = discount?.kind === "gift" ? discount.montant : 0
  // Tout est réglé par la carte cadeau : pas de passage par Stripe.
  const nothingToPay = q.total === 0 && paidByGift > 0
  const statut: BookingStatus = stripeEnabled || nothingToPay ? "en_attente" : "demande"

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
      montantTotal: q.sousTotal - (discount?.kind === "promo" ? discount.montant : 0),
      montantCarteCadeau: paidByGift,
      promoCode: discount?.kind === "promo" ? discount.id : undefined,
      giftCard: discount?.kind === "gift" ? discount.id : undefined,
    },
  })
  const reference = created.reference!

  if (nothingToPay) {
    await confirmBooking(created.id, { method: "carte cadeau" }, siteUrl)
    return { kind: "confirmed", reference }
  }

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
    line_items:
      q.remise > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: Math.round(q.total * 100),
                product_data: {
                  name: `${adventure.title} — ${input.adultes + input.enfants} participant${input.adultes + input.enfants > 1 ? "s" : ""}`,
                  description: `${slot.date}${slot.heure ? ` · ${slot.heure}` : ""} · ${q.remiseLibelle}`,
                },
              },
            },
          ]
        : q.lignes.map((line) => ({
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
    const now = new Date().toISOString()
    await payload.update({
      collection: "bookings",
      id: bookingId,
      data: {
        statut: "confirmee",
        payeLe: now,
        stripeSessionId: payment.sessionId ?? current.stripeSessionId,
        stripePaymentIntentId: payment.paymentIntentId ?? current.stripePaymentIntentId,
        moyenPaiement: payment.method ?? current.moyenPaiement,
        numeroFacture: current.numeroFacture ?? (await nextInvoiceNumber(payload)),
        factureEmiseLe: current.factureEmiseLe ?? now,
      },
    })
    await consumeDiscounts(payload, current)
  }

  const booking = await loadBooking(payload, bookingId)
  if (booking && !current.confirmationEnvoyeeLe) {
    const settings = await getSettings()
    // Premier paiement : le compte client existe déjà (fiche), on envoie le lien
    // pour définir le mot de passe tant qu'il n'a jamais été activé.
    let activationUrl: string | undefined
    const customerId = typeof current.customer === "object" ? current.customer?.id : current.customer
    if (customerId) {
      const customer = await payload.findByID({ collection: "customers", id: customerId, depth: 0 })
      if (!customer.compteActiveLe) {
        activationUrl = await issueActivationUrl(payload, customer.email, siteUrl).catch(() => undefined)
      }
    }
    const mail = bookingConfirmationEmail(booking, settings, siteUrl, activationUrl)
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

/** Numéro de facture séquentiel par année : FAC-2027-0001. */
async function nextInvoiceNumber(payload: Payload): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `FAC-${year}-`
  const { docs } = await payload.find({
    collection: "bookings",
    where: { numeroFacture: { like: prefix } },
    sort: "-numeroFacture",
    limit: 1,
    depth: 0,
  })
  const last = docs[0]?.numeroFacture
  const n = last?.startsWith(prefix) ? Number.parseInt(last.slice(prefix.length), 10) + 1 : 1
  return `${prefix}${String(n).padStart(4, "0")}`
}

/** À la confirmation : le code promo compte une utilisation, la carte cadeau est débitée. */
async function consumeDiscounts(payload: Payload, booking: BookingDoc) {
  const promoId = typeof booking.promoCode === "object" ? booking.promoCode?.id : booking.promoCode
  if (promoId) {
    const promo = await payload.findByID({ collection: "promo-codes", id: promoId, depth: 0 })
    await payload.update({ collection: "promo-codes", id: promoId, data: { utilisations: (promo.utilisations ?? 0) + 1 }, context: { skipRevalidate: true } })
  }
  const giftId = typeof booking.giftCard === "object" ? booking.giftCard?.id : booking.giftCard
  if (giftId && (booking.montantCarteCadeau ?? 0) > 0) {
    const card = await payload.findByID({ collection: "gift-cards", id: giftId, depth: 0 })
    const solde = Math.max(0, (card.solde ?? card.montantInitial) - (booking.montantCarteCadeau ?? 0))
    await payload.update({ collection: "gift-cards", id: giftId, data: { solde, statut: solde <= 0 ? "epuisee" : "active" } })
  }
}

/** À l'annulation : la carte cadeau est recréditée. */
async function restoreGiftCard(payload: Payload, booking: BookingDoc) {
  const giftId = typeof booking.giftCard === "object" ? booking.giftCard?.id : booking.giftCard
  if (!giftId || !(booking.montantCarteCadeau ?? 0)) return
  const card = await payload.findByID({ collection: "gift-cards", id: giftId, depth: 0 })
  const solde = (card.solde ?? 0) + (booking.montantCarteCadeau ?? 0)
  await payload.update({ collection: "gift-cards", id: giftId, data: { solde, statut: "active" } })
}

export type CancelOptions = {
  rembourser: boolean
  motif: string
  origine: "admin" | "client"
  siteUrl: string
}

/** Jours entiers entre aujourd'hui (Paris) et la date du créneau. */
export function daysUntil(dateKey: string): number {
  const today = new Date(`${toDateKey(new Date())}T12:00:00.000Z`).getTime()
  const target = new Date(`${dateKey}T12:00:00.000Z`).getTime()
  return Math.round((target - today) / 86_400_000)
}

/**
 * Annule une réservation. Si demandé et possible, rembourse le paiement
 * Stripe en totalité ; recrédite la carte cadeau ; libère les places
 * (crochet) ; prévient le client.
 */
export async function cancelBooking(bookingId: number | string, options: CancelOptions): Promise<Booking | undefined> {
  const payload = await getPayloadClient()
  const current = await payload.findByID({ collection: "bookings", id: bookingId, depth: 0 })
  if (current.statut === "annulee" || current.statut === "remboursee") {
    throw new BookingError("Cette réservation est déjà annulée.")
  }

  let refunded = 0
  let refundId: string | undefined
  const paidOnline = current.statut === "confirmee" && current.stripePaymentIntentId
  if (options.rembourser && paidOnline) {
    const refund = await getStripe().refunds.create({ payment_intent: current.stripePaymentIntentId!, reason: "requested_by_customer" })
    refunded = (refund.amount ?? 0) / 100
    refundId = refund.id
  } else if (options.rembourser && current.stripeSessionId && current.statut === "en_attente") {
    await getStripe().checkout.sessions.expire(current.stripeSessionId).catch(() => undefined)
  }
  if (current.statut === "confirmee") await restoreGiftCard(payload, current)

  await payload.update({
    collection: "bookings",
    id: bookingId,
    data: {
      statut: refunded > 0 ? "remboursee" : "annulee",
      annuleLe: new Date().toISOString(),
      motifAnnulation: `${options.origine === "client" ? "Annulation par le client" : "Annulation par Traversia"} — ${options.motif}`,
      montantRembourse: refunded || undefined,
      stripeRefundId: refundId,
    },
  })

  const booking = await loadBooking(payload, bookingId)
  if (booking && current.statut !== "en_attente") {
    const settings = await getSettings()
    const mail = bookingCancellationEmail(booking, settings, options.siteUrl, options.motif, refunded + (current.montantCarteCadeau ?? 0))
    await sendEmail({ to: booking.email, replyTo: settings.email, ...mail })
    if (options.origine === "client") {
      const admin = adminBookingEmail(booking, options.siteUrl)
      await sendEmail({ to: settings.email, replyTo: booking.email, ...admin })
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
