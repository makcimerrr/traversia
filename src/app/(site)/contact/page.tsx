import type { Metadata } from "next"

import { ContactForm } from "@/components/site/contact-form"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getAdventures, getSettings } from "@/lib/content"

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à Traversia — bureau de Clécy, Calvados.",
}

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const [{ aventure, motif }, adventures, settings] = await Promise.all([
    searchParams,
    getAdventures(),
    getSettings(),
  ])

  const coordonnees = [
    { label: "Courriel", value: settings.email },
    { label: "Téléphone", value: settings.telephone },
    { label: "Adresse", value: settings.adresse.replace(/\n/g, ", ") },
    { label: "Saison", value: settings.horaires },
  ].filter((item) => item.value)

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          Dites-nous où vous voulez aller
        </h1>
      </Container>

      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <dl className="border-t border-border">
              {coordonnees.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-1 border-b border-border py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="label text-muted-foreground">{item.label}</dt>
                  <dd className="font-mono text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
              Nous répondons sous quarante-huit heures en saison, un peu plus
              longtemps l&apos;hiver — nous sommes souvent dehors à retracer.
            </p>
          </div>

          <ContactForm
            adventures={adventures.map((a) => ({ slug: a.slug, title: a.title }))}
            defaultAdventure={typeof aventure === "string" ? aventure : undefined}
            defaultMotif={typeof motif === "string" ? motif : undefined}
          />
        </Container>
      </Section>
    </>
  )
}
