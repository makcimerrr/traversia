import type { Endpoint } from "payload"

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
    if (!req.user) return Response.json({ message: "Non autorisé." }, { status: 401 })
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
