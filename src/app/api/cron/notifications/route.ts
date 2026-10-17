import { getPayloadClient } from "@/lib/payload"
import { getSettings } from "@/lib/content"
import { toDateKey } from "@/lib/demo"
import { traceOpensAt } from "@/lib/customer-account"
import { pushToCustomers } from "@/lib/push"

/**
 * Tâche planifiée (Vercel Cron, toutes les heures) : notifications push
 * programmées. Rappel la veille de la sortie à partir de 17 h (Paris), et
 * annonce de l'ouverture du tracé à l'heure prévue. Chaque envoi est daté
 * sur la réservation pour ne jamais partir deux fois.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Non autorisé.", { status: 401 })
  }

  const payload = await getPayloadClient()
  const settings = await getSettings()
  const now = new Date()
  const today = toDateKey(now)
  const tomorrow = toDateKey(new Date(now.getTime() + 86_400_000))
  const parisHour = Number(new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hour12: false, timeZone: "Europe/Paris" }).format(now))

  const { docs } = await payload.find({
    collection: "bookings",
    where: {
      and: [
        { statut: { equals: "confirmee" } },
        { "slot.date": { greater_than_equal: `${today}T00:00:00.000Z` } },
        { "slot.date": { less_than: `${tomorrow}T23:59:59.999Z` } },
      ],
    },
    limit: 500,
    depth: 1,
    pagination: false,
  })

  let rappels = 0
  let ouvertures = 0
  for (const booking of docs) {
    const slot = typeof booking.slot === "object" ? booking.slot : null
    const adventure = typeof booking.adventure === "object" ? booking.adventure : null
    const customerId = typeof booking.customer === "object" ? booking.customer?.id : booking.customer
    if (!slot || !adventure || !customerId) continue
    const dateKey = toDateKey(new Date(slot.date))
    const heure = slot.heure || adventure.rendezVous?.heure || "08h00"

    if (dateKey === tomorrow && parisHour >= 17 && !booking.rappelJ1EnvoyeLe) {
      await pushToCustomers(payload, [customerId], {
        title: "C'est demain",
        body: `${adventure.title} — rendez-vous ${heure}${adventure.rendezVous?.lieu ? `, ${adventure.rendezVous.lieu}` : ""}. Vérifiez votre équipement.`,
        data: { bookingId: String(booking.id), screen: "reservation" },
      })
      await payload.update({ collection: "bookings", id: booking.id, data: { rappelJ1EnvoyeLe: now.toISOString() }, context: { skipRevalidate: true } })
      rappels++
    }

    const opensAt = traceOpensAt(dateKey, heure, settings.ouvertureTraceHeures)
    if (opensAt.getTime() <= now.getTime() && !booking.ouvertureTraceEnvoyeeLe && adventure.gpx) {
      await pushToCustomers(payload, [customerId], {
        title: "Le tracé est ouvert",
        body: `${adventure.title} : le parcours et le guidage sont disponibles dans l'app.`,
        data: { bookingId: String(booking.id), screen: "carte" },
      })
      await payload.update({ collection: "bookings", id: booking.id, data: { ouvertureTraceEnvoyeeLe: now.toISOString() }, context: { skipRevalidate: true } })
      ouvertures++
    }
  }

  return Response.json({ examinees: docs.length, rappels, ouvertures })
}
