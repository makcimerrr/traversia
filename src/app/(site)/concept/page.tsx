import type { Metadata } from "next"

import { ButtonLink } from "@/components/site/button-link"
import { ElevationProfile } from "@/components/site/elevation-profile"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getAdventures, getPartners, getRegions } from "@/lib/content"

export const metadata: Metadata = {
  title: "Le concept Traversia",
  description:
    "Un pack aventure, c'est un itinéraire fermé qui associe randonnée et canoë sur un même territoire, encadré par des guides et opéré avec des partenaires nautiques locaux.",
}

const ETAPES = [
  {
    step: "01",
    title: "Vous choisissez un parcours",
    body: "Chaque fiche annonce la distance, le dénivelé, les temps de marche et de pagaie, le niveau conseillé et l'âge minimum. Ce qui est écrit est ce que nous avons mesuré.",
  },
  {
    step: "02",
    title: "Vous réservez une date",
    body: "Le calendrier affiche les places restantes en temps réel. Paiement en ligne, confirmation immédiate, informations pratiques et trace GPX dans la foulée.",
  },
  {
    step: "03",
    title: "Vous marchez, puis vous pagayez",
    body: "Le matin sur les crêtes avec un guide, le déjeuner au bord de l'eau, l'après-midi sur la rivière avec le matériel d'un partenaire nautique local. Navette retour comprise.",
  },
]

const ENGAGEMENTS = [
  {
    title: "Des itinéraires fermés",
    body: "On repart d'où l'on est arrivé. Pas de logistique de véhicule, pas de matériel à posséder.",
  },
  {
    title: "Des partenaires du territoire",
    body: "Les canoës, les gilets et les navettes sont ceux des bases nautiques locales. Nous concevons et encadrons ; elles opèrent.",
  },
  {
    title: "Des groupes limités",
    body: "Douze personnes au maximum, huit sur les parcours engagés, pour que le guide parle à chacun.",
  },
  {
    title: "Une annulation sans discussion",
    body: "Crue, orage, vent de mer : report ou remboursement intégral, au choix. La décision appartient au guide.",
  },
]

export default async function ConceptPage() {
  const [adventures, partners, regions] = await Promise.all([
    getAdventures(),
    getPartners(),
    getRegions(),
  ])
  const activeRegions = regions.filter((r) => r.active)
  const upcomingRegions = regions.filter((r) => !r.active)

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Le concept</Eyebrow>
        <h1 className="mt-8 max-w-4xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          Un territoire, traversé deux fois dans la journée
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Un pack aventure Traversia associe une randonnée et une descente en
          canoë sur un même itinéraire. Le paysage se découvre par le haut le
          matin, puis par l&apos;eau l&apos;après-midi. Tout est compris : le guide,
          le matériel nautique, la navette.
        </p>
      </Container>

      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <figure className="border border-border lg:sticky lg:top-28 lg:self-start">
            <figcaption className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="label text-muted-foreground">Une journée type</span>
              <span className="label text-muted-foreground tabular-nums">21 km — 480 m D+</span>
            </figcaption>
            <div className="px-4 pt-6">
              <ElevationProfile className="h-40 sm:h-52" />
            </div>
            <div className="grid grid-cols-2 border-t border-border">
              <div className="border-r border-border px-4 py-3">
                <p className="label-sm text-muted-foreground">Matin</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest">Randonnée</p>
              </div>
              <div className="px-4 py-3">
                <p className="label-sm text-muted-foreground">Après-midi</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest">Canoë</p>
              </div>
            </div>
          </figure>

          <ol className="border-t border-border">
            {ETAPES.map((item) => (
              <li
                key={item.step}
                className="grid gap-4 border-b border-border py-8 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-8"
              >
                <span className="label text-muted-foreground tabular-nums">{item.step}</span>
                <div>
                  <h2 className="text-2xl leading-tight">{item.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container className="py-14 sm:py-20">
          <Eyebrow>Nos engagements</Eyebrow>
          <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2">
            {ENGAGEMENTS.map((item) => (
              <div key={item.title} className="bg-background p-6 sm:p-8">
                <h2 className="text-2xl leading-tight">{item.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {[
            { value: String(adventures.length), label: "Parcours au catalogue" },
            { value: String(partners.length), label: "Partenaires nautiques" },
            { value: activeRegions.map((r) => r.name).join(", ") || "—", label: "Région ouverte" },
            {
              value: upcomingRegions.map((r) => r.name).join(", ") || "Bientôt",
              label: "Prochaine région",
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className={[
                "px-4 py-8 sm:px-6 lg:px-8",
                i % 2 === 0 ? "border-r border-border" : "",
                i < 3 ? "md:border-r md:border-border" : "",
                i < 2 ? "border-b border-border md:border-b-0" : "",
              ].join(" ")}
            >
              <dt className="label-sm text-muted-foreground">{item.label}</dt>
              <dd className="mt-3 font-display text-2xl leading-tight sm:text-3xl">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <Container className="flex flex-wrap items-center justify-between gap-6 py-14">
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Le catalogue commence en Normandie et s&apos;étend région par région,
            avec un partenaire nautique à chaque fois.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/aventures">Voir les parcours</ButtonLink>
            <ButtonLink href="/partenaires" variant="ghost">
              Les partenaires
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  )
}
