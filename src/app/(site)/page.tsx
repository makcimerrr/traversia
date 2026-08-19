import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { AdventureCard } from "@/components/adventures/adventure-card"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { DayProfile } from "@/components/site/day-profile"
import { getAdventures } from "@/lib/content"
import { cn } from "@/lib/utils"

const PRINCIPE = [
  {
    step: "01",
    title: "Le matin, les crêtes",
    body: "Une randonnée guidée sur la partie haute de l'itinéraire. On monte tôt, on prend les points de vue avant la chaleur, et le guide raconte le terrain qu'on va redescendre.",
  },
  {
    step: "02",
    title: "À midi, la bascule",
    body: "Déjeuner au bord de l'eau, à l'endroit exact où l'on quitte la marche pour la pagaie. Produits normands, une heure pleine, sans se presser.",
  },
  {
    step: "03",
    title: "L'après-midi, la rivière",
    body: "Le même paysage, vu d'en bas et au ras de l'eau. Canoë biplace, aucune expérience requise, un guide en ouverture et un en fermeture.",
  },
]

function reperes(prixMini: number) {
  return [
    { value: "Avril → Octobre", label: "Saison" },
    { value: "12 personnes", label: "Groupe maximum" },
    { value: `${prixMini} €`, label: "À partir de" },
    { value: "8 ans", label: "Âge minimum" },
  ]
}

export default async function HomePage() {
  const adventures = await getAdventures()
  const featured = adventures.slice(0, 3)
  const REPERES = reperes(Math.min(...adventures.map((a) => a.prix)))

  return (
    <>
      {/* ------------------------------ Hero ------------------------------ */}
      {/* Marginalia de feuille de carte : ce que porte le bord d'une carte
          pliée — zone couverte, contenu, édition. */}
      <div className="border-b border-border">
        <Container className="flex items-center justify-between gap-4 py-3">
          <span className="label text-muted-foreground">Normandie</span>
          <span className="hidden label text-muted-foreground sm:inline">
            Randonnée + canoë
          </span>
          <span className="label text-muted-foreground">Depuis 2019</span>
        </Container>
      </div>

      <Section bordered={false}>
        <Container className="grid gap-12 pt-14 pb-16 sm:pt-20 lg:grid-cols-[1.35fr_minmax(0,1fr)] lg:items-end lg:gap-16 lg:pt-24">
          {/* Le titre est construit comme une entrée de légende :
              le geste, un filet, le moment de la journée. */}
          <h1 className="text-[2.5rem] leading-[1.06] sm:text-6xl lg:text-[5rem]">
            <span className="sr-only">
              Marcher le matin, pagayer l&apos;après-midi.
            </span>
            <span aria-hidden className="flex flex-col gap-2 sm:gap-3">
              {[
                { verb: "Marcher", moment: "le matin" },
                { verb: "Pagayer", moment: "l'après-midi" },
              ].map((line) => (
                <span key={line.verb} className="flex items-baseline gap-3 sm:gap-5">
                  <span className="uppercase tracking-[0.04em]">{line.verb}</span>
                  <span className="h-px min-w-4 flex-1 translate-y-[-0.28em] bg-border" />
                  <span className="whitespace-nowrap text-[0.6em] italic text-muted-foreground">
                    {line.moment}
                  </span>
                </span>
              ))}
            </span>
          </h1>

          <div className="lg:pb-3">
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Traversia trace des itinéraires qui associent une randonnée et une
              descente en canoë sur un même territoire, dans la même journée. Le
              paysage se traverse deux fois : par le haut, puis par l&apos;eau.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/aventures"
                className="group inline-flex items-center justify-center gap-3 border border-foreground bg-foreground px-6 py-4 label text-background transition-colors hover:bg-background hover:text-foreground"
              >
                Voir la carte des parcours
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/entreprise"
                className="inline-flex items-center justify-center border border-border px-6 py-4 label text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Qui sommes-nous
              </Link>
            </div>
          </div>
        </Container>

        {/* Signature : une journée entière, lue comme un profil de carte.
            Hachures obliques pour le relief, horizontales pour l'eau. */}
        <figure className="border-t border-border">
          <Container className="flex items-baseline justify-between gap-4 py-3">
            <figcaption className="label text-muted-foreground">
              Profil d&apos;une journée
            </figcaption>
            <span className="label text-muted-foreground tabular-nums">
              21 km — 480 m D+
            </span>
          </Container>
          <div className="border-t border-border">
            <Container className="py-8 sm:py-10">
              <DayProfile />
            </Container>
          </div>
        </figure>
      </Section>

      {/* ---------------------------- Repères ----------------------------- */}
      <Section>
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {REPERES.map((item, i) => (
            <div
              key={item.label}
              className={cn(
                "px-4 py-8 sm:px-6 lg:px-8",
                i % 2 === 0 && "border-r border-border",
                i < 3 && "md:border-r md:border-border",
                i < 2 && "border-b border-border md:border-b-0",
              )}
            >
              <dt className="label-sm text-muted-foreground">{item.label}</dt>
              <dd className="mt-3 font-display text-2xl leading-tight sm:text-3xl">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ---------------------------- Le principe ------------------------- */}
      <Section>
        <Container className="py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow>Le principe</Eyebrow>
              <h2 className="mt-7 max-w-md text-4xl leading-[1.02] sm:text-5xl">
                Une journée, deux façons de traverser
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                Chaque pack aventure est un itinéraire fermé : on repart d&apos;où
                l&apos;on est arrivé. Pas de logistique à prévoir, pas de matériel
                à posséder, pas de niveau minimum au-delà de celui annoncé sur la
                fiche.
              </p>
            </div>

            <ol className="border-t border-border">
              {PRINCIPE.map((item) => (
                <li
                  key={item.step}
                  className="grid gap-4 border-b border-border py-8 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-8"
                >
                  <span className="label text-muted-foreground tabular-nums">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-2xl leading-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* -------------------------- Aperçu parcours ----------------------- */}
      <Section>
        <Container className="py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Au catalogue</Eyebrow>
              <h2 className="mt-7 text-4xl leading-none sm:text-5xl">
                Trois parcours pour commencer
              </h2>
            </div>
            <Link
              href="/aventures"
              className="group inline-flex items-center gap-2 label text-muted-foreground transition-colors hover:text-foreground"
            >
              Les {adventures.length} parcours sur la carte
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((adventure, i) => (
              <AdventureCard key={adventure.slug} adventure={adventure} index={i} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------- CTA ------------------------------ */}
      <Section>
        <Container className="grid gap-8 py-16 sm:py-20 lg:grid-cols-[1.2fr_minmax(0,1fr)] lg:items-center">
          <h2 className="max-w-2xl text-4xl leading-[1.02] sm:text-5xl">
            Le calendrier 2027 ouvre en février.
            <span className="text-muted-foreground"> Les groupes sont limités à douze.</span>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 border border-foreground bg-foreground px-6 py-4 label text-background transition-colors hover:bg-background hover:text-foreground"
            >
              Nous écrire
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
