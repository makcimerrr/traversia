import "server-only"

import { toDateKey } from "./demo"
import { giftCardEmail, giftCardReceiptEmail, sendEmail } from "./email"
import { getPayloadClient, usePayload } from "./payload"
import { getStripe, stripeEnabled } from "./stripe"
import type { GiftCardView } from "./types"
import type { GiftCard as GiftCardDoc } from "@/payload-types"

/** Achat d'une carte cadeau : création en attente, paiement Stripe, activation et envoi. */

export class GiftCardError extends Error {}

export function toGiftCard(doc: GiftCardDoc): GiftCardView {
  return {
    id: String(doc.id),
    code: doc.code ?? "",
    statut: doc.statut,
    montantInitial: doc.montantInitial,
    solde: doc.solde ?? doc.montantInitial,
    acheteurNom: doc.acheteurNom ?? "",
    acheteurEmail: doc.acheteurEmail ?? "",
    beneficiaireNom: doc.beneficiaireNom ?? "",
    beneficiaireEmail: doc.beneficiaireEmail ?? undefined,
    messagePerso: doc.messagePerso ?? undefined,
    expireLe: doc.expireLe ? toDateKey(new Date(doc.expireLe)) : undefined,
  }
}

export type GiftCardInput = {
  montant: number
  acheteurNom: string
  acheteurEmail: string
  beneficiaireNom: string
  beneficiaireEmail: string
  messagePerso: string
}

export async function createGiftCardOrder(input: GiftCardInput, siteUrl: string): Promise<{ url: string }> {
  if (!usePayload) throw new GiftCardError("Les cartes cadeaux ne sont pas disponibles en démonstration.")
  if (!stripeEnabled) throw new GiftCardError("Le paiement en ligne n'est pas encore activé. Écrivez-nous pour commander une carte cadeau.")
  if (!Number.isFinite(input.montant) || input.montant < 20 || input.montant > 1000) {
    throw new GiftCardError("Le montant doit être compris entre 20 et 1 000 €.")
  }
  const payload = await getPayloadClient()
  const created = await payload.create({
    collection: "gift-cards",
    data: {
      statut: "en_attente",
      montantInitial: input.montant,
      acheteurNom: input.acheteurNom,
      acheteurEmail: input.acheteurEmail.toLowerCase(),
      beneficiaireNom: input.beneficiaireNom || undefined,
      beneficiaireEmail: input.beneficiaireEmail ? input.beneficiaireEmail.toLowerCase() : undefined,
      messagePerso: input.messagePerso || undefined,
    },
  })
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    locale: "fr",
    customer_email: input.acheteurEmail.toLowerCase(),
    metadata: { kind: "gift", giftCardId: String(created.id) },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(input.montant * 100),
          product_data: {
            name: `Carte cadeau Traversia — ${input.montant} €`,
            description: input.beneficiaireNom ? `Pour ${input.beneficiaireNom}` : "Valable un an sur tous les parcours",
          },
        },
      },
    ],
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${siteUrl}/cartes-cadeaux/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cartes-cadeaux?annule=1`,
  })
  if (!session.url) throw new GiftCardError("Stripe n'a pas renvoyé de page de paiement.")
  await payload.update({ collection: "gift-cards", id: created.id, data: { stripeSessionId: session.id } })
  return { url: session.url }
}

/** Paiement reçu : la carte devient active, le code est envoyé. Idempotent. */
export async function completeGiftCard(
  giftCardId: number | string,
  payment: { sessionId?: string; paymentIntentId?: string },
  siteUrl: string,
): Promise<GiftCardView> {
  const payload = await getPayloadClient()
  const current = await payload.findByID({ collection: "gift-cards", id: giftCardId, depth: 0 })
  if (current.statut === "en_attente") {
    await payload.update({
      collection: "gift-cards",
      id: giftCardId,
      data: {
        statut: "active",
        payeLe: new Date().toISOString(),
        stripeSessionId: payment.sessionId ?? current.stripeSessionId,
        stripePaymentIntentId: payment.paymentIntentId ?? current.stripePaymentIntentId,
      },
    })
  }
  const doc = await payload.findByID({ collection: "gift-cards", id: giftCardId, depth: 0 })
  const card = toGiftCard(doc)
  if (!doc.envoyeeLe) {
    const receipt = giftCardReceiptEmail(card, siteUrl)
    await sendEmail({ to: card.acheteurEmail, ...receipt })
    if (card.beneficiaireEmail) {
      const gift = giftCardEmail(card, siteUrl)
      await sendEmail({ to: card.beneficiaireEmail, replyTo: card.acheteurEmail, ...gift })
    }
    await payload.update({ collection: "gift-cards", id: giftCardId, data: { envoyeeLe: new Date().toISOString() } })
  }
  return card
}

export async function expireGiftCard(giftCardId: number | string): Promise<void> {
  const payload = await getPayloadClient()
  const current = await payload.findByID({ collection: "gift-cards", id: giftCardId, depth: 0 })
  if (current.statut === "en_attente") {
    await payload.update({ collection: "gift-cards", id: giftCardId, data: { statut: "annulee" } })
  }
}

/** Retour de Stripe : vérifie la session et active la carte sans attendre le webhook. */
export async function reconcileGiftCardSession(sessionId: string, siteUrl: string): Promise<GiftCardView | undefined> {
  if (!usePayload || !stripeEnabled) return undefined
  const session = await getStripe().checkout.sessions.retrieve(sessionId)
  const id = session.metadata?.giftCardId
  if (session.metadata?.kind !== "gift" || !id) return undefined
  if (session.payment_status === "paid") {
    return completeGiftCard(id, {
      sessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    }, siteUrl)
  }
  const payload = await getPayloadClient()
  return toGiftCard(await payload.findByID({ collection: "gift-cards", id, depth: 0 }))
}
