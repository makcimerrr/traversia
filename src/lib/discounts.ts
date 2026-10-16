import type { Payload } from "payload"

import { toDateKey } from "./demo"
import type { GiftCard as GiftCardDoc, PromoCode as PromoCodeDoc } from "@/payload-types"

/**
 * Résolution d'un code saisi dans le tunnel : code promotionnel ou carte
 * cadeau. Renvoie la remise applicable à un sous-total donné, ou la raison
 * du refus. Rien n'est consommé ici : la consommation a lieu à la
 * confirmation du paiement (voir bookings.ts).
 */

export type Discount =
  | {
      kind: "promo"
      id: number
      code: string
      libelle: string
      /** Montant de la remise, déjà borné au sous-total. */
      montant: number
    }
  | {
      kind: "gift"
      id: number
      code: string
      libelle: string
      /** Part du sous-total réglée par la carte, bornée au solde. */
      montant: number
      solde: number
    }

export class DiscountError extends Error {}

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "")
}

function promoAmount(promo: PromoCodeDoc, sousTotal: number): number {
  const brut = promo.type === "pourcentage" ? (sousTotal * promo.valeur) / 100 : promo.valeur
  return Math.min(sousTotal, Math.round(brut * 100) / 100)
}

export async function resolveDiscount(
  payload: Payload,
  rawCode: string,
  context: { sousTotal: number; adventureId: number },
): Promise<Discount> {
  const code = normalizeCode(rawCode)
  if (!code) throw new DiscountError("Saisissez un code.")
  const today = toDateKey(new Date())

  if (code.startsWith("CADEAU-")) {
    const { docs } = await payload.find({ collection: "gift-cards", where: { code: { equals: code } }, limit: 1, depth: 0 })
    const card: GiftCardDoc | undefined = docs[0]
    if (!card) throw new DiscountError("Cette carte cadeau est inconnue.")
    if (card.statut === "en_attente") throw new DiscountError("Cette carte cadeau n'a pas encore été réglée.")
    if (card.statut !== "active") throw new DiscountError("Cette carte cadeau n'est plus valable.")
    if (card.expireLe && toDateKey(new Date(card.expireLe)) < today) throw new DiscountError("Cette carte cadeau a expiré.")
    const solde = card.solde ?? card.montantInitial
    if (solde <= 0) throw new DiscountError("Le solde de cette carte cadeau est épuisé.")
    return {
      kind: "gift",
      id: card.id,
      code,
      libelle: `Carte cadeau ${code}`,
      montant: Math.min(solde, context.sousTotal),
      solde,
    }
  }

  const { docs } = await payload.find({ collection: "promo-codes", where: { code: { equals: code } }, limit: 1, depth: 0 })
  const promo: PromoCodeDoc | undefined = docs[0]
  if (!promo || !promo.actif) throw new DiscountError("Ce code n'est pas valable.")
  if (promo.validDepuis && toDateKey(new Date(promo.validDepuis)) > today) throw new DiscountError("Ce code n'est pas encore actif.")
  if (promo.validJusquau && toDateKey(new Date(promo.validJusquau)) < today) throw new DiscountError("Ce code a expiré.")
  if (promo.usageMax && (promo.utilisations ?? 0) >= promo.usageMax) throw new DiscountError("Ce code a atteint son nombre d'utilisations.")
  if (promo.minimumPanier && context.sousTotal < promo.minimumPanier) {
    throw new DiscountError(`Ce code s'applique à partir de ${promo.minimumPanier} €.`)
  }
  const allowed = (promo.adventures ?? []).map((a) => (typeof a === "object" ? a.id : a))
  if (allowed.length && !allowed.includes(context.adventureId)) throw new DiscountError("Ce code ne s'applique pas à ce parcours.")

  return {
    kind: "promo",
    id: promo.id,
    code,
    libelle: promo.description || (promo.type === "pourcentage" ? `Code ${code} (−${promo.valeur} %)` : `Code ${code} (−${promo.valeur} €)`),
    montant: promoAmount(promo, context.sousTotal),
  }
}
