import "server-only"

import Stripe from "stripe"

/**
 * Client Stripe, créé à la demande. Les clés sont injectées par
 * l'intégration Stripe du Marketplace Vercel (STRIPE_SECRET_KEY) ;
 * sans clé, le tunnel bascule en « demande de réservation » sans paiement.
 */
export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY)

let client: Stripe | undefined

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquante : le paiement en ligne n'est pas configuré.")
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY, { appInfo: { name: "Traversia" } })
  return client
}
