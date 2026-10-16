import { getBookingByReference } from "@/lib/bookings"
import { qrPng } from "@/lib/qr"
import { siteUrl } from "@/lib/site-url"

/** QR code PNG renvoyant vers la page de la réservation, à présenter au guide. */
export async function GET(_request: Request, { params }: RouteContext<"/reservation/[reference]/qr">) {
  const { reference } = await params
  const booking = await getBookingByReference(reference)
  if (!booking) return new Response("Réservation introuvable.", { status: 404 })
  const png = await qrPng(`${await siteUrl()}/reservation/${booking.reference}`)
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=86400" },
  })
}
