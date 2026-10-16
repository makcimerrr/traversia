import type { Endpoint } from "payload"

import { isAdmin, isCustomer } from "./access"

/**
 * Les modules de réservation sont marqués `server-only` : on les charge à
 * l'appel, pour que la configuration Payload reste importable par la CLI
 * (génération des types, seed).
 */

/**
 * POST /api/bookings/:id/annuler — réservé aux utilisateurs connectés à
 * l'administration. Corps JSON : { rembourser: boolean, motif?: string }.
 */
export const cancelBookingEndpoint: Endpoint = {
  path: "/:id/annuler",
  method: "post",
  handler: async (req) => {
    if (!isAdmin(req)) return Response.json({ message: "Non autorisé." }, { status: 401 })
    const id = String(req.routeParams?.id ?? "")
    let body: { rembourser?: boolean; motif?: string } = {}
    try {
      body = req.json ? await req.json() : {}
    } catch {
      body = {}
    }
    const [{ cancelBooking, BookingError }, { siteUrlFromEnv }] = await Promise.all([
      import("./bookings"),
      import("./site-url"),
    ])
    try {
      const booking = await cancelBooking(id, {
        rembourser: Boolean(body.rembourser),
        motif: body.motif?.trim() || "Annulation par Traversia.",
        origine: "admin",
        siteUrl: siteUrlFromEnv(),
      })
      return Response.json({
        message:
          booking?.statut === "remboursee"
            ? `Réservation annulée et remboursée (${booking.montantRembourse} €).`
            : "Réservation annulée.",
        statut: booking?.statut,
      })
    } catch (error) {
      const status = error instanceof BookingError ? 400 : 500
      return Response.json({ message: (error as Error).message }, { status })
    }
  },
}

/**
 * GET /api/bookings/:id/trace — le fichier GPX du parcours, pour le client
 * propriétaire d'une réservation confirmée, à partir de l'heure d'ouverture
 * (rendez-vous moins le délai des paramètres). Avant, 423 avec `ouvreLe`.
 */
export const traceEndpoint: Endpoint = {
  path: "/:id/trace",
  method: "get",
  handler: async (req) => {
    if (!req.user) return Response.json({ message: "Connexion requise." }, { status: 401 })
    const id = String(req.routeParams?.id ?? "")
    const booking = await req.payload.findByID({ collection: "bookings", id, depth: 2, overrideAccess: true }).catch(() => null)
    if (!booking) return Response.json({ message: "Réservation introuvable." }, { status: 404 })
    const ownerId = typeof booking.customer === "object" ? booking.customer?.id : booking.customer
    if (!isAdmin(req) && !(isCustomer(req) && ownerId === req.user.id)) {
      return Response.json({ message: "Réservation introuvable." }, { status: 404 })
    }
    if (booking.statut !== "confirmee") return Response.json({ message: "La réservation n'est pas confirmée." }, { status: 403 })
    const slot = typeof booking.slot === "object" ? booking.slot : null
    const adventure = typeof booking.adventure === "object" ? booking.adventure : null
    if (!slot || !adventure) return Response.json({ message: "Réservation incomplète." }, { status: 500 })

    const [{ traceOpensAt, toDateKey }, { getSettings }] = await Promise.all([import("./customer-account"), import("./content")])
    const settings = await getSettings()
    const heure = slot.heure || adventure.rendezVous?.heure || "08h00"
    const opensAt = traceOpensAt(toDateKey(new Date(slot.date)), heure, settings.ouvertureTraceHeures)
    if (!isAdmin(req) && Date.now() < opensAt.getTime()) {
      return Response.json({ message: "Le tracé s'ouvre peu avant le départ.", ouvreLe: opensAt.toISOString() }, { status: 423 })
    }
    const gpx = typeof adventure.gpx === "object" ? adventure.gpx : null
    if (!gpx?.url) return Response.json({ message: "Aucune trace GPX pour ce parcours." }, { status: 404 })
    const url = gpx.url.startsWith("http") ? gpx.url : new URL(gpx.url, req.url ?? "http://localhost").toString()
    return Response.redirect(url, 302)
  },
}
