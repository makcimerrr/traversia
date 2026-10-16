import type { Metadata } from "next"

import { ButtonLink } from "@/components/site/button-link"
import { FaqList } from "@/components/site/faq-list"
import { JsonLd } from "@/components/site/json-ld"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getFaqs } from "@/lib/content"
import { FAQ_CATEGORY_LABELS } from "@/lib/types"

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Niveau requis, âge minimum, matériel, météo, annulation : tout ce qu'il faut savoir avant de réserver un pack aventure.",
}

export default async function FaqPage() {
  const faqs = await getFaqs({ general: true })
  const categories = Object.entries(FAQ_CATEGORY_LABELS).filter(([key]) =>
    faqs.some((f) => f.categorie === key),
  )

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.reponse },
          })),
        }}
      />
      <Container className="py-14 sm:py-20">
        <Eyebrow>Questions fréquentes</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          Ce qu&apos;on nous demande avant de partir
        </h1>
        <nav className="mt-10 flex flex-wrap gap-2" aria-label="Catégories">
          {categories.map(([key, label]) => (
            <a
              key={key}
              href={`#${key}`}
              className="border border-border px-3.5 py-2.5 label-sm transition-colors hover:border-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </Container>

      <Section>
        <Container className="py-14 sm:py-20">
          <FaqList faqs={faqs} grouped />
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-wrap items-center justify-between gap-6 py-14">
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Une question qui n&apos;est pas ici ? Nous répondons sous quarante-huit heures.
          </p>
          <ButtonLink href="/contact">Nous écrire</ButtonLink>
        </Container>
      </Section>
    </>
  )
}
