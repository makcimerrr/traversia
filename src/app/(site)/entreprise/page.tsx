import type { Metadata } from "next"
import Link from "next/link"

import { Container, Eyebrow, Section } from "@/components/site/section"

export const metadata: Metadata = {
  title: "L'entreprise",
  description:
    "Traversia, atelier d'itinéraires normands : qui nous sommes, comment nous travaillons, ce que nous refusons de faire.",
}

const REPERES = [
  { year: "2019", title: "Premier tracé", body: "Deux guides, un canoë prêté, la boucle de Clécy testée quarante fois avant d'être proposée." },
  { year: "2021", title: "Bureau à Clécy", body: "Installation dans l'ancienne quincaillerie du bourg, qui sert d'atelier et de point de départ." },
  { year: "2023", title: "Sept itinéraires", body: "Le catalogue se stabilise. On arrête d'en ajouter pour entretenir ceux qui existent." },
  { year: "2026", title: "Aujourd'hui", body: "Quatre guides permanents, une saison d'avril à octobre, environ six cents personnes par an." },
]

const PRINCIPES = [
  {
    title: "On repère tout à pied",
    body: "Aucun itinéraire n'est vendu avant d'avoir été parcouru dans les deux sens, à quatre saisons différentes. Ce qui apparaît sur la fiche est ce que nous avons mesuré nous-mêmes.",
  },
  {
    title: "Les groupes restent petits",
    body: "Douze personnes au maximum, huit sur les parcours engagés. Au-delà, on ne peut plus parler, et la rivière cesse d'être calme.",
  },
  {
    title: "Le matériel est fourni",
    body: "Canoës, pagaies, gilets, bidons étanches, tentes sur les nuitées. Vous venez avec des chaussures de marche et de quoi vous changer.",
  },
  {
    title: "On annule sans discuter",
    body: "Crue, vent de mer, coefficient défavorable : la sortie est reportée ou remboursée intégralement. La décision appartient au guide, pas au client.",
  },
]

export default function EntreprisePage() {
  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>L&apos;entreprise</Eyebrow>
        <h1 className="mt-8 max-w-4xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          Un atelier d&apos;itinéraires, installé dans une vallée
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Traversia n&apos;est pas une agence : nous ne revendons le parcours de
          personne. Nous traçons, nous mesurons, nous encadrons. Le reste du temps,
          nous entretenons les sentiers et les accès à l&apos;eau avec les
          communes qui nous accueillent.
        </p>
      </Container>

      {/* --------------------------- Repères --------------------------- */}
      <Section>
        <Container className="py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-3xl leading-tight sm:text-4xl">Quelques repères</h2>
            </div>
            <ol className="border-t border-border">
              {REPERES.map((item) => (
                <li
                  key={item.year}
                  className="grid gap-3 border-b border-border py-7 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-8"
                >
                  <span className="label text-muted-foreground tabular-nums">
                    {item.year}
                  </span>
                  <div>
                    <h3 className="text-xl leading-tight">{item.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* -------------------------- Principes -------------------------- */}
      <Section>
        <Container className="py-14 sm:py-20">
          <Eyebrow>Nos règles</Eyebrow>
          <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2">
            {PRINCIPES.map((item) => (
              <div key={item.title} className="bg-background p-6 sm:p-8">
                <h3 className="text-2xl leading-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------------------- Citation -------------------------- */}
      <Section>
        <Container className="py-16 sm:py-24">
          <blockquote className="max-w-4xl">
            <p className="font-display text-3xl leading-[1.15] sm:text-5xl">
              « Une vallée ne se comprend pas depuis un seul point de vue. Il faut
              l&apos;avoir dominée, puis l&apos;avoir remontée par le fond. »
            </p>
            <footer className="mt-8 label text-muted-foreground">
              Camille Rouault — guide, cofondatrice
            </footer>
          </blockquote>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-wrap items-center justify-between gap-6 py-14">
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Une question sur un parcours, un projet de groupe, une date qui
            n&apos;apparaît pas au calendrier ?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 border border-foreground bg-foreground px-6 py-4 label text-background transition-colors hover:bg-background hover:text-foreground"
          >
            Nous écrire
          </Link>
        </Container>
      </Section>
    </>
  )
}
