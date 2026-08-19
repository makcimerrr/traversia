import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { DifficultyMeter } from "@/components/adventures/difficulty-meter"
import { StatGrid } from "@/components/adventures/stat-grid"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { ElevationProfile } from "@/components/site/elevation-profile"
import { getAdventure, getAdventures } from "@/lib/content"

export async function generateStaticParams() {
  const adventures = await getAdventures()
  return adventures.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/aventures/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const adventure = await getAdventure(slug)
  if (!adventure) return {}
  return { title: adventure.title, description: adventure.tagline }
}

export default async function AdventurePage({
  params,
}: PageProps<"/aventures/[slug]">) {
  const { slug } = await params
  const adventures = await getAdventures()
  const position = adventures.findIndex((a) => a.slug === slug)
  const adventure = adventures[position]
  if (!adventure) notFound()

  const next = adventures[(position + 1) % adventures.length]

  return (
    <>
      <Container className="py-10 sm:py-14">
        <Link
          href="/aventures"
          className="group inline-flex items-center gap-2 label text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Toutes les aventures
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] lg:items-end">
          <div>
            <Eyebrow>
              {String(position + 1).padStart(2, "0")} — {adventure.commune},{" "}
              {adventure.departement}
            </Eyebrow>
            <h1 className="mt-8 text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
              {adventure.title}
            </h1>
            <p className="mt-6 max-w-xl font-display text-xl italic leading-snug text-muted-foreground sm:text-2xl">
              {adventure.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-5 border-l border-border pl-6">
            <div>
              <p className="label-sm text-muted-foreground">Difficulté</p>
              <DifficultyMeter value={adventure.difficulty} className="mt-3" />
            </div>
            <div>
              <p className="label-sm text-muted-foreground">Saison</p>
              <p className="mt-2.5 font-mono text-sm">{adventure.saison}</p>
            </div>
            <div>
              <p className="label-sm text-muted-foreground">Tarif</p>
              <p className="mt-2.5 font-mono text-sm tabular-nums">
                {adventure.prix} € par personne
              </p>
            </div>
          </div>
        </div>
      </Container>

      <Section>
        <Container className="py-12 sm:py-16">
          <StatGrid adventure={adventure} columns={3} className="sm:grid-cols-3" />
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <Eyebrow>L&apos;itinéraire</Eyebrow>
            <p className="mt-8 text-lg leading-relaxed sm:text-xl">
              {adventure.intro}
            </p>

            <h2 className="mt-12 text-2xl">Temps forts</h2>
            <ul className="mt-5 border-t border-border">
              {adventure.temps_forts.map((point) => (
                <li
                  key={point}
                  className="border-b border-border py-3.5 text-sm leading-snug"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <figure className="border border-border">
              <figcaption className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="label text-muted-foreground">Profil</span>
                <span className="label text-muted-foreground tabular-nums">
                  {adventure.stats.distanceKm} km — {adventure.stats.deniveleM} m D+
                </span>
              </figcaption>
              <div className="px-4 pt-6">
                <ElevationProfile className="h-40" />
              </div>
              <div className="grid grid-cols-2 border-t border-border">
                <div className="border-r border-border px-4 py-3">
                  <p className="label-sm text-muted-foreground">Randonnée</p>
                  <p className="mt-2 font-mono text-xs tabular-nums">
                    {adventure.stats.randoKm} km
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="label-sm text-muted-foreground">Canoë</p>
                  <p className="mt-2 font-mono text-xs tabular-nums">
                    {adventure.stats.canoeKm} km
                  </p>
                </div>
              </div>
            </figure>

            <h2 className="mt-12 text-2xl">Ce qui est compris</h2>
            <ul className="mt-5 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
              {adventure.inclus.map((item) => (
                <li key={item} className="bg-background px-4 py-3.5 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="py-14 sm:py-20">
          <Eyebrow>Déroulé</Eyebrow>
          <ol className="mt-10 border-t border-border">
            {adventure.programme.map((step) => (
              <li
                key={step.time}
                className="grid gap-3 border-b border-border py-7 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8"
              >
                <span className="label text-muted-foreground tabular-nums">
                  {step.time}
                </span>
                <div>
                  <h3 className="text-xl leading-tight">{step.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-wrap items-center justify-between gap-6 py-14">
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 border border-foreground bg-foreground px-6 py-4 label text-background transition-colors hover:bg-background hover:text-foreground"
          >
            Réserver ce parcours
          </Link>
          <Link
            href={`/aventures/${next.slug}`}
            className="group text-right"
          >
            <span className="label text-muted-foreground">Parcours suivant</span>
            <span className="mt-2 flex items-center justify-end gap-2 font-display text-2xl">
              {next.title}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Container>
      </Section>
    </>
  )
}
