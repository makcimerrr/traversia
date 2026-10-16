import { getBookingByReference } from "@/lib/bookings"
import { getSettings } from "@/lib/content"
import { invoicePdf } from "@/lib/invoice"

/** Facture PDF d'une réservation confirmée, générée à la volée. */
export async function GET(_request: Request, { params }: RouteContext<"/reservation/[reference]/facture">) {
  const { reference } = await params
  const booking = await getBookingByReference(reference)
  if (!booking) return new Response("Réservation introuvable.", { status: 404 })
  if (booking.statut !== "confirmee" && booking.statut !== "remboursee") {
    return new Response("La facture est disponible une fois le paiement confirmé.", { status: 409 })
  }
  const pdf = await invoicePdf(booking, await getSettings())
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${booking.numeroFacture ?? booking.reference}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  })
}
