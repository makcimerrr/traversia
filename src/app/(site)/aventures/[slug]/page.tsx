import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { DifficultyMeter } from "@/components/adventures/difficulty-meter"
import { Gallery } from "@/components/adventures/gallery"
import { Reviews } from "@/components/adventures/reviews"
import { StatGrid } from "@/components/adventures/stat-grid"
import { UpcomingSlots } from "@/components/adventures/upcoming-slots"
import { ButtonLink } from "@/components/site/button-link"
import { ElevationProfile } from "@/components/site/elevation-profile"
import { FaqList } from "@/components/site/faq-list"
import { JsonLd } from "@/components/site/json-ld"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getAdventure, getAdventures, getFaqs, getReviews, getSlots } from "@/lib/content"
import { formatHours, formatPrice } from "@/lib/format"
import { siteUrlFromEnv } from "@/lib/site-url"

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
  return {
    title: adventure.title,
    description: adventure.tagline,
    openGraph: adventure.cover ? { images: [{ url: adventure.cover.url, alt: adventure.cover.alt }] } : undefined,
  }
}

function List({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 border-b border-border py-3 text-sm leading-snug">
          <span aria-hidden className="mt-[0.45em] size-1 shrink-0 bg-foreground" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function AdventurePage({ params }: PageProps<"/aventures/[slug]">) {
  const { slug } = await params
  const adventures = await getAdventures()
  const position = adventures.findIndex((a) => a.slug === slug)
  const adventure = adventures[position]
  if (!adventure) notFound()

  const [slots, faqs, reviews] = await Promise.all([
    getSlots({ adventureSlug: slug }),
    getFaqs({ adventureSlug: slug }),
    getReviews(slug),
  ])
  const next = adventures[(position + 1) % adventures.length]
  const openSlots = slots.filter((s) => s.statut === "ouvert" && s.placesRestantes > 0)
  const rdv = adventure.rendezVous
  const mapHref =
    rdv.lat && rdv.lng
      ? `https://www.openstreetmap.org/?mlat=${rdv.lat}&mlon=${rdv.lng}#map=14/${rdv.lat}/${rdv.lng}`
      : undefined

  const base = siteUrlFromEnv()
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: adventure.title,
    description: adventure.intro,
    image: adventure.cover?.url,
    url: `${base}/aventures/${adventure.slug}`,
    brand: { "@type": "Brand", name: "Traversia" },
    category: "Pack aventure randonnée et canoë",
    offers: {
      "@type": "Offer",
      price: adventure.prix,
      priceCurrency: "EUR",
      availability: openSlots.length ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${base}/aventures/${adventure.slug}/reserver`,
      areaServed: adventure.regionName,
    },
    aggregateRating:
      reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: (reviews.reduce((s, r) => s + r.note, 0) / reviews.length).toFixed(1),
            reviewCount: reviews.length,
            bestRating: 5,
          }
        : undefined,
  }
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: base },
      { "@type": "ListItem", position: 2, name: "Les aventures", item: `${base}/aventures` },
      { "@type": "ListItem", position: 3, name: adventure.title, item: `${base}/aventures/${adventure.slug}` },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumb} />
      {/* ------------------------------ En-tête ------------------------------ */}
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
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="label-sm text-muted-foreground">Saison</p>
                <p className="mt-2.5 font-mono text-sm">{adventure.saison}</p>
              </div>
              <div>
                <p className="label-sm text-muted-foreground">Âge minimum</p>
                <p className="mt-2.5 font-mono text-sm tabular-nums">{adventure.ageMin} ans</p>
              </div>
            </div>
            <div>
              <p className="label-sm text-muted-foreground">Tarif</p>
              <p className="mt-2.5 font-mono text-sm tabular-nums">
                {formatPrice(adventure.prix)} par personne
                {adventure.prixEnfant && (
                  <span className="text-muted-foreground">
                    {" "}
                    — {formatPrice(adventure.prixEnfant)} jusqu&apos;à {adventure.ageEnfantMax} ans
                  </span>
                )}
              </p>
            </div>
            <ButtonLink
              href={openSlots[0] ? `/aventures/${adventure.slug}/reserver?creneau=${openSlots[0].id}` : `/aventures/${adventure.slug}/reserver`}
              className="self-start"
            >
              Réserver
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </Container>

      {adventure.cover && (
        <Section>
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={adventure.cover.url}
              alt={adventure.cover.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover grayscale"
            />
          </div>
        </Section>
      )}

      {/* ------------------------------ Mesures ------------------------------ */}
      <Section>
        <Container className="py-12 sm:py-16">
          <StatGrid adventure={adventure} columns={3} className="sm:grid-cols-3 lg:grid-cols-6" />
        </Container>
      </Section>

      {/* ----------------------------- Itinéraire ---------------------------- */}
      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <Eyebrow>L&apos;itinéraire</Eyebrow>
            <p className="mt-8 text-lg leading-relaxed sm:text-xl">{adventure.intro}</p>

            <h2 className="mt-12 text-2xl">Temps forts</h2>
            <ul className="mt-5 border-t border-border">
              {adventure.temps_forts.map((point) => (
                <li key={point} className="border-b border-border py-3.5 text-sm leading-snug">
                  {point}
                </li>
              ))}
            </ul>

            {adventure.niveauConseille && (
              <>
                <h2 className="mt-12 text-2xl">Niveau conseillé</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {adventure.niveauConseille}
                </p>
              </>
            )}
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
                    {adventure.stats.tempsRandoH > 0 && ` — ${formatHours(adventure.stats.tempsRandoH)}`}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="label-sm text-muted-foreground">Canoë</p>
                  <p className="mt-2 font-mono text-xs tabular-nums">
                    {adventure.stats.canoeKm} km
                    {adventure.stats.tempsCanoeH > 0 && ` — ${formatHours(adventure.stats.tempsCanoeH)}`}
                  </p>
                </div>
              </div>
            </figure>

            <UpcomingSlots adventure={adventure} slots={slots} className="mt-8" />
          </div>
        </Container>
      </Section>

      {/* ------------------------------- Déroulé ----------------------------- */}
      <Section>
        <Container className="py-14 sm:py-20">
          <Eyebrow>Déroulé</Eyebrow>
          <ol className="mt-10 border-t border-border">
            {adventure.programme.map((step) => (
              <li
                key={step.time}
                className="grid gap-3 border-b border-border py-7 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8"
              >
                <span className="label text-muted-foreground tabular-nums">{step.time}</span>
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

      {/* ------------------------- Compris / à prévoir ----------------------- */}
      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-3 lg:gap-10">
          <div>
            <h2 className="text-2xl">Ce qui est compris</h2>
            <List items={adventure.inclus} className="mt-5 border-t border-border" />
          </div>
          <div>
            <h2 className="text-2xl">Ce qui ne l&apos;est pas</h2>
            <List items={adventure.nonInclus} className="mt-5 border-t border-border" />
          </div>
          <div>
            <h2 className="text-2xl">À apporter</h2>
            <List items={adventure.equipement} className="mt-5 border-t border-border" />
          </div>
        </Container>
      </Section>

      {/* ------------------------------ Pratique ----------------------------- */}
      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <Eyebrow>Rendez-vous</Eyebrow>
            <div className="mt-8 border border-border">
              <dl>
                {[
                  { label: "Lieu", value: rdv.lieu },
                  { label: "Adresse", value: rdv.adresse },
                  { label: "Heure", value: rdv.heure },
                  { label: "Partenaire", value: adventure.partnerName },
                ]
                  .filter((row) => row.value)
                  .map((row) => (
                    <div
                      key={row.label}
                      className="grid gap-1 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6"
                    >
                      <dt className="label-sm text-muted-foreground">{row.label}</dt>
                      <dd className="text-sm">{row.value}</dd>
                    </div>
                  ))}
              </dl>
              {mapHref && (
                <div className="border-t border-border px-5 py-3">
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 label link-underline"
                  >
                    Voir sur la carte
                    <span className="font-mono text-[0.625rem] normal-case tracking-normal text-muted-foreground">
                      {rdv.lat?.toFixed(4)} N — {Math.abs(rdv.lng ?? 0).toFixed(4)} {(rdv.lng ?? 0) < 0 ? "W" : "E"}
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <Eyebrow>Informations pratiques</Eyebrow>
            <dl className="mt-8 border-t border-border">
              {adventure.pratique.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-2 border-b border-border py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8"
                >
                  <dt className="label text-muted-foreground">{item.label}</dt>
                  <dd className="max-w-xl text-sm leading-relaxed">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      {adventure.gallery.length > 0 && (
        <Section>
          <Container className="py-14 sm:py-20">
            <Eyebrow>Galerie</Eyebrow>
            <Gallery images={adventure.gallery} className="mt-8" />
          </Container>
        </Section>
      )}

      {reviews.length > 0 && (
        <Section>
          <Container className="py-14 sm:py-20">
            <Eyebrow>Avis</Eyebrow>
            <Reviews reviews={reviews} className="mt-8" />
          </Container>
        </Section>
      )}

      {faqs.length > 0 && (
        <Section>
          <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow>Questions fréquentes</Eyebrow>
              <h2 className="mt-7 text-3xl leading-tight">Sur ce parcours</h2>
              <Link href="/faq" className="mt-6 inline-block label link-underline">
                Toutes les questions
              </Link>
            </div>
            <FaqList faqs={faqs} />
          </Container>
        </Section>
      )}

      {/* --------------------------------- CTA ------------------------------- */}
      <Section>
        <Container className="flex flex-wrap items-center justify-between gap-6 py-14">
          <ButtonLink
            href={openSlots[0] ? `/aventures/${adventure.slug}/reserver?creneau=${openSlots[0].id}` : `/aventures/${adventure.slug}/reserver`}
          >
            Réserver ce parcours
          </ButtonLink>
          <Link href={`/aventures/${next.slug}`} className="group text-right">
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
