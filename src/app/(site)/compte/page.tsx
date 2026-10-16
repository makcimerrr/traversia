import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { LoginForm, RequestLinkForm } from "@/components/account/account-forms"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { logoutAction } from "@/lib/actions/account"
import { getCustomer } from "@/lib/customer-session"
import { formatDateLong, formatPrice } from "@/lib/format"
import { getPayloadClient } from "@/lib/payload"
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/types"

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } }

export default async function ComptePage() {
  const customer = await getCustomer()

  if (!customer) {
    return (
      <>
        <Container className="py-14 sm:py-20">
          <Eyebrow>Mon compte</Eyebrow>
          <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">Vos réservations, vos documents</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Le compte est créé à votre première réservation payée. Le même identifiant sert sur le site et dans l&apos;application.
          </p>
        </Container>
        <Section>
          <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="text-2xl">Se connecter</h2>
              <div className="mt-6 max-w-sm">
                <LoginForm />
              </div>
            </div>
            <div>
              <h2 className="text-2xl">Première connexion ou mot de passe oublié</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Nous vous envoyons un lien pour définir votre mot de passe.
              </p>
              <div className="mt-6 max-w-sm">
                <RequestLinkForm />
              </div>
            </div>
          </Container>
        </Section>
      </>
    )
  }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: "bookings",
    where: { customer: { equals: customer.id } },
    sort: "-createdAt",
    limit: 50,
    depth: 1,
    overrideAccess: true,
  })

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Mon compte</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">Bonjour {customer.prenom}.</h1>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <p className="font-mono text-sm text-muted-foreground">{customer.email}</p>
          <form action={logoutAction}>
            <button type="submit" className="label link-underline">
              Se déconnecter
            </button>
          </form>
        </div>
      </Container>
      <Section>
        <Container className="py-14 sm:py-20">
          <h2 className="text-2xl">Vos réservations</h2>
          {docs.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Aucune réservation pour l&apos;instant.</p>
          ) : (
            <ol className="mt-6 border-t border-border">
              {docs.map((b) => {
                const adventure = typeof b.adventure === "object" ? b.adventure : null
                const slot = typeof b.slot === "object" ? b.slot : null
                return (
                  <li key={b.id} className="border-b border-border">
                    <Link href={`/reservation/${b.reference}`} className="group grid gap-3 py-6 sm:grid-cols-[11rem_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-8">
                      <span className="label text-muted-foreground tabular-nums">{b.reference}</span>
                      <span>
                        <span className="block text-xl leading-tight">{adventure?.title}</span>
                        <span className="mt-1 block text-sm capitalize text-muted-foreground">
                          {slot ? formatDateLong(slot.date.slice(0, 10)) : ""}
                        </span>
                      </span>
                      <span className="label-sm text-muted-foreground">{BOOKING_STATUS_LABELS[b.statut as BookingStatus]}</span>
                      <span className="flex items-center gap-2 font-mono text-sm tabular-nums">
                        {formatPrice(b.montantTotal)}
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          )}
        </Container>
      </Section>
    </>
  )
}
