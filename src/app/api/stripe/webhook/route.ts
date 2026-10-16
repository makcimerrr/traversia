import type Stripe from "stripe"

import { confirmBooking, expireBooking, markRefunded } from "@/lib/bookings"
import { completeGiftCard, expireGiftCard } from "@/lib/gift-cards"
import { siteUrlFromEnv } from "@/lib/site-url"
import { getStripe, stripeEnabled } from "@/lib/stripe"

/**
 * Webhook Stripe. À déclarer dans le tableau de bord Stripe sur
 * /api/stripe/webhook avec les événements checkout.session.completed,
 * checkout.session.expired et charge.refunded ; le secret de signature va
 * dans STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeEnabled || !secret) {
    return new Response("Webhook non configuré.", { status: 503 })
  }
  const signature = request.headers.get("stripe-signature")
  if (!signature) return new Response("Signature manquante.", { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret)
  } catch (error) {
    console.warn("[stripe] Signature invalide.", error)
    return new Response("Signature invalide.", { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id
        if (session.metadata?.kind === "gift" && session.metadata.giftCardId && session.payment_status === "paid") {
          await completeGiftCard(session.metadata.giftCardId, { sessionId: session.id, paymentIntentId: paymentIntent }, siteUrlFromEnv())
          break
        }
        const bookingId = session.metadata?.bookingId
        if (bookingId && session.payment_status === "paid") {
          await confirmBooking(
            bookingId,
            {
              sessionId: session.id,
              paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
              method: session.payment_method_types?.[0],
            },
            siteUrlFromEnv(),
          )
        }
        break
      }
      case "checkout.session.expired": {
        const meta = event.data.object.metadata
        if (meta?.kind === "gift" && meta.giftCardId) await expireGiftCard(meta.giftCardId)
        else if (meta?.bookingId) await expireBooking(meta.bookingId)
        break
      }
      case "charge.refunded": {
        const charge = event.data.object
        const paymentIntent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id
        const refund = charge.refunds?.data?.[0]
        if (paymentIntent && refund) await markRefunded(paymentIntent, charge.amount_refunded, refund.id)
        break
      }
      default:
        break
    }
  } catch (error) {
    console.error(`[stripe] Traitement de ${event.type} échoué.`, error)
    return new Response("Erreur de traitement.", { status: 500 })
  }

  return Response.json({ received: true })
}
