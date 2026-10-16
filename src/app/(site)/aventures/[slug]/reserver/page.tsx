import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { BookingForm } from "@/components/booking/booking-form"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getAdventure, getSlots } from "@/lib/content"
import { stripeEnabled } from "@/lib/stripe"

export async function generateMetadata({ params }: PageProps<"/aventures/[slug]/reserver">): Promise<Metadata> {
  const { slug } = await params
  const adventure = await getAdventure(slug)
  if (!adventure) return {}
  return { title: `Réserver — ${adventure.title}`, robots: { index: false } }
}

export default async function ReserverPage({ params, searchParams }: PageProps<"/aventures/[slug]/reserver">) {
  const [{ slug }, { creneau, annule }] = await Promise.all([params, searchParams])
  const adventure = await getAdventure(slug)
  if (!adventure) notFound()
  const slots = (await getSlots({ adventureSlug: slug, includeFull: false })).filter((s) => s.placesRestantes > 0)

  return (
    <>
      <Container className="py-10 sm:py-14">
        <Link
          href={`/aventures/${slug}`}
          className="group inline-flex items-center gap-2 label text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Retour à la fiche
        </Link>
        <Eyebrow className="mt-10">Réservation</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl">{adventure.title}</h1>
        <p className="mt-5 max-w-xl font-display text-xl italic leading-snug text-muted-foreground">
          {adventure.tagline}
        </p>
      </Container>
      <Section>
        <Container className="py-14 sm:py-20">
          <BookingForm
            adventure={adventure}
            slots={slots}
            initialSlotId={typeof creneau === "string" ? creneau : undefined}
            paymentEnabled={stripeEnabled}
            cancelled={annule === "1"}
          />
        </Container>
      </Section>
    </>
  )
}
