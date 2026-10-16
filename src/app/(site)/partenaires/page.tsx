import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ButtonLink } from "@/components/site/button-link"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getAdventures, getPartners, getRegions } from "@/lib/content"

export const metadata: Metadata = {
  title: "Nos partenaires",
  description:
    "Les bases nautiques et clubs de canoë-kayak qui opèrent les packs aventure Traversia, région par région.",
}

export default async function PartenairesPage() {
  const [partners, adventures, regions] = await Promise.all([
    getPartners(),
    getAdventures(),
    getRegions(),
  ])

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Partenaires</Eyebrow>
        <h1 className="mt-8 max-w-4xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          Les bases nautiques qui font la rivière
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Traversia conçoit et encadre les itinéraires ; les canoës, les gilets
          et les navettes sont ceux de partenaires installés sur place depuis
          longtemps. Chaque créneau du calendrier est opéré par l&apos;un d&apos;eux.
        </p>
      </Container>

      {regions.map((region) => {
        const inRegion = partners.filter((p) => p.regionSlugs.includes(region.slug))
        if (inRegion.length === 0 && region.active) return null
        return (
          <Section key={region.slug}>
            <Container className="py-14 sm:py-20">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <Eyebrow>{region.active ? "Région ouverte" : "Bientôt"}</Eyebrow>
                  <h2 className="mt-7 text-4xl leading-none sm:text-5xl">{region.name}</h2>
                </div>
                {region.description && (
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    {region.description}
                  </p>
                )}
              </div>

              {inRegion.length > 0 ? (
                <ul className="mt-12 grid gap-px border border-border bg-border md:grid-cols-2">
                  {inRegion.map((partner) => {
                    const theirs = adventures.filter((a) => a.partnerSlug === partner.slug)
                    return (
                      <li key={partner.slug} className="flex flex-col bg-background p-6 sm:p-8">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="label-sm text-muted-foreground">
                              {partner.commune}
                              {partner.departement && ` — ${partner.departement}`}
                            </p>
                            <h3 className="mt-2.5 text-3xl leading-[1.05]">{partner.name}</h3>
                          </div>
                          {partner.logo && (
                            <Image
                              src={partner.logo.url}
                              alt={partner.logo.alt}
                              width={64}
                              height={64}
                              className="size-16 object-contain grayscale"
                            />
                          )}
                        </div>
                        {partner.tagline && (
                          <p className="mt-3 font-display text-lg italic leading-snug text-muted-foreground">
                            {partner.tagline}
                          </p>
                        )}
                        {partner.description && (
                          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                            {partner.description}
                          </p>
                        )}
                        <div className="flex-1" />
                        {theirs.length > 0 && (
                          <ul className="mt-6 border-t border-border">
                            {theirs.map((a) => (
                              <li key={a.slug} className="border-b border-border">
                                <Link
                                  href={`/aventures/${a.slug}`}
                                  className="group flex items-center justify-between gap-4 py-3 text-sm"
                                >
                                  {a.title}
                                  <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                        {partner.website && (
                          <a
                            href={partner.website}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="mt-5 self-start label link-underline"
                          >
                            Site du partenaire
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="mt-10 label-sm text-muted-foreground">Partenaires en cours de sélection</p>
              )}
            </Container>
          </Section>
        )
      })}

      <Section>
        <Container className="flex flex-wrap items-center justify-between gap-6 py-14">
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Vous gérez une base nautique et souhaitez proposer un pack aventure
            sur votre rivière ?
          </p>
          <ButtonLink href="/contact?motif=autre">Devenir partenaire</ButtonLink>
        </Container>
      </Section>
    </>
  )
}
