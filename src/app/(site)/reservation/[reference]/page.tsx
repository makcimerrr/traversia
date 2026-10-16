import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CancelForm } from "@/components/booking/cancel-form"
import { ReviewForm } from "@/components/booking/review-form"
import { ButtonLink } from "@/components/site/button-link"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { daysUntil, getBookingByReference, reconcileCheckoutSession } from "@/lib/bookings"
import { getSettings } from "@/lib/content"
import { toDateKey } from "@/lib/demo"
import { formatDateLong, formatPrice } from "@/lib/format"
import { siteUrl } from "@/lib/site-url"
import { BOOKING_STATUS_LABELS } from "@/lib/types"

export const metadata: Metadata = { title: "Votre réservation", robots: { index: false } }

const HEADLINES = {
  confirmee: "C'est réservé.",
  en_attente: "Paiement en attente.",
  demande: "Demande bien reçue.",
  annulee: "Réservation annulée.",
  remboursee: "Réservation remboursée.",
} as const

export default async function ReservationPage({ params, searchParams }: PageProps<"/reservation/[reference]">) {
  const [{ reference }, { session_id: sessionId }] = await Promise.all([params, searchParams])
  const booking =
    typeof sessionId === "string"
      ? await reconcileCheckoutSession(reference, sessionId, await siteUrl())
      : await getBookingByReference(reference)
  if (!booking) notFound()
  const settings = await getSettings()
  const { adventure, slot } = booking

  const rows = [
    ["Référence", booking.reference],
    ["Statut", BOOKING_STATUS_LABELS[booking.statut]],
    ["Date", formatDateLong(slot.date)],
    ["Rendez-vous", [slot.heure || adventure.rendezVous.heure, adventure.rendezVous.lieu].filter(Boolean).join(" — ")],
    ["Adresse", adventure.rendezVous.adresse],
    ["Partenaire", slot.partnerName],
    [
      "Participants",
      [
        booking.nbAdultes ? `${booking.nbAdultes} adulte${booking.nbAdultes > 1 ? "s" : ""}` : "",
        booking.nbEnfants ? `${booking.nbEnfants} enfant${booking.nbEnfants > 1 ? "s" : ""}` : "",
      ]
        .filter(Boolean)
        .join(", "),
    ],
    ["Montant", formatPrice(booking.montantTotal)],
    booking.remise > 0 ? [booking.remiseLibelle || "Remise", `− ${formatPrice(booking.remise)}`] : ["", ""],
    booking.montantCarteCadeau > 0 ? ["Carte cadeau", `− ${formatPrice(booking.montantCarteCadeau)}`] : ["", ""],
    booking.numeroFacture ? ["Facture", booking.numeroFacture] : ["", ""],
  ].filter(([, v]) => v)
  const past = slot.date < toDateKey(new Date())
  const canSelfCancel =
    (booking.statut === "confirmee" || booking.statut === "demande") &&
    daysUntil(slot.date) >= settings.delaiAnnulationJours

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Réservation {booking.reference}</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          {HEADLINES[booking.statut]}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          {booking.statut === "confirmee" &&
            `Un e-mail de confirmation est parti à ${booking.email} avec les horaires, le point de rendez-vous et la liste du matériel.`}
          {booking.statut === "demande" &&
            `Nous revenons vers vous sous quarante-huit heures à ${booking.email} pour confirmer la date et organiser le règlement.`}
          {booking.statut === "en_attente" &&
            "Le paiement n'a pas encore été confirmé. Si vous venez de payer, rechargez cette page dans quelques instants."}
          {(booking.statut === "annulee" || booking.statut === "remboursee") &&
            "Cette réservation n'est plus active. Pour toute question, écrivez-nous."}
        </p>
      </Container>

      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 className="text-2xl">{adventure.title}</h2>
            <dl className="mt-6 border-t border-border">
              {rows.map(([label, value]) => (
                <div key={label} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="label-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/aventures/${adventure.slug}`} variant="ghost">
                Revoir la fiche
              </ButtonLink>
              {(booking.statut === "confirmee" || booking.statut === "remboursee") && (
                <ButtonLink href={`/reservation/${booking.reference}/facture`} variant="outline" target="_blank">
                  Facture PDF
                </ButtonLink>
              )}
              {adventure.gpx && (
                <ButtonLink href={adventure.gpx.url} variant="outline">
                  Trace GPX
                </ButtonLink>
              )}
            </div>

            {booking.statut === "confirmee" && (
              <figure className="mt-10 flex items-center gap-6 border border-border p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/reservation/${booking.reference}/qr`}
                  alt={`QR code de la réservation ${booking.reference}`}
                  width={120}
                  height={120}
                  className="size-[120px] border border-border"
                />
                <figcaption className="text-sm leading-relaxed text-muted-foreground">
                  <span className="label-sm">Le jour J</span>
                  <br />
                  Présentez ce code au guide, sur votre téléphone ou imprimé. Il ouvre cette page.
                </figcaption>
              </figure>
            )}

            {booking.statut === "confirmee" && past && (
              <div className="mt-10">
                <h2 className="label text-muted-foreground">Votre avis</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Comment s&apos;est passée la journée ? Votre avis aide les prochains à choisir.
                </p>
                <ReviewForm reference={booking.reference} />
              </div>
            )}

            {(booking.statut === "confirmee" || booking.statut === "demande") && !past && (
              <div className="mt-10">
                <h2 className="label text-muted-foreground">Annuler</h2>
                {canSelfCancel ? (
                  <CancelForm reference={booking.reference} delai={settings.delaiAnnulationJours} />
                ) : (
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Le délai d&apos;annulation gratuite ({settings.delaiAnnulationJours} jours avant la date) est dépassé.
                    Écrivez-nous à{" "}
                    <Link href={`mailto:${settings.email}`} className="link-underline">
                      {settings.email}
                    </Link>{" "}
                    en indiquant votre référence : un avoir d&apos;un an vous sera proposé.
                  </p>
                )}
              </div>
            )}
          </div>

          {booking.statut === "confirmee" || booking.statut === "demande" ? (
            <div>
              <h2 className="text-2xl">Avant de partir</h2>
              <h3 className="mt-6 label text-muted-foreground">Horaires</h3>
              <ol className="mt-3 border-t border-border">
                {adventure.programme.map((step) => (
                  <li key={step.time} className="grid gap-1 border-b border-border py-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
                    <span className="font-mono text-xs text-muted-foreground">{step.time}</span>
                    <span>{step.title}</span>
                  </li>
                ))}
              </ol>
              <h3 className="mt-8 label text-muted-foreground">À apporter</h3>
              <ul className="mt-3 border-t border-border">
                {adventure.equipement.map((item) => (
                  <li key={item} className="border-b border-border py-3 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
              {adventure.pratique.length > 0 && (
                <>
                  <h3 className="mt-8 label text-muted-foreground">Informations pratiques</h3>
                  <dl className="mt-3 border-t border-border">
                    {adventure.pratique.map((item) => (
                      <div key={item.label} className="border-b border-border py-3 text-sm">
                        <dt className="font-mono text-xs text-muted-foreground">{item.label}</dt>
                        <dd className="mt-1">{item.detail}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  )
}
