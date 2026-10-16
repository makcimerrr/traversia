import type { Metadata } from "next"

import { GiftCardForm } from "@/components/gift/gift-card-form"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getAdventures } from "@/lib/content"
import { formatPrice } from "@/lib/format"
import { stripeEnabled } from "@/lib/stripe"

export const metadata: Metadata = {
  title: "Cartes cadeaux",
  description: "Offrez une journée de randonnée et de canoë : carte cadeau valable un an sur tous les packs aventure Traversia.",
}

export default async function CartesCadeauxPage({ searchParams }: PageProps<"/cartes-cadeaux">) {
  const [{ annule }, adventures] = await Promise.all([searchParams, getAdventures()])
  const prices = adventures.map((a) => a.prix)
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Cartes cadeaux</Eyebrow>
        <h1 className="mt-8 max-w-4xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          Offrir une journée entre crêtes et rivière
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          La carte cadeau se règle en ligne, arrive par e-mail avec un code,
          et se dépense sur n&apos;importe quel parcours, à n&apos;importe quelle
          date, pendant un an. Le solde restant reste utilisable.
        </p>
      </Container>
      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-2xl">Quel montant ?</h2>
            <dl className="mt-6 border-t border-border">
              {[
                ["Une place", `${formatPrice(min)} à ${formatPrice(max)} selon le parcours`],
                ["Deux places", `${formatPrice(min * 2)} à ${formatPrice(max * 2)}`],
                ["Validité", "Un an à compter de l'achat"],
                ["Utilisation", "Code à saisir au moment de réserver, en une ou plusieurs fois"],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="label-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <GiftCardForm paymentEnabled={stripeEnabled} cancelled={annule === "1"} />
        </Container>
      </Section>
    </>
  )
}
