import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ButtonLink } from "@/components/site/button-link"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getBookingByReference, reconcileCheckoutSession } from "@/lib/bookings"
import { getSettings } from "@/lib/content"
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
  ].filter(([, v]) => v)

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
              {adventure.gpx && (
                <ButtonLink href={adventure.gpx.url} variant="outline">
                  Trace GPX
                </ButtonLink>
              )}
            </div>
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
              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                Annulation gratuite jusqu&apos;à {settings.delaiAnnulationJours} jours avant la date, en écrivant à{" "}
                <Link href={`mailto:${settings.email}`} className="link-underline">
                  {settings.email}
                </Link>{" "}
                avec votre référence.
              </p>
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  )
}
