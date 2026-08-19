import type { Metadata } from "next"

import { AdventuresExplorer } from "@/components/adventures/adventures-explorer"
import { Container, Eyebrow } from "@/components/site/section"
import { getAdventures } from "@/lib/content"

export const metadata: Metadata = {
  title: "Les aventures",
  description:
    "Sept packs aventure randonnée et canoë en Normandie, à découvrir sur la carte.",
}

export default async function AventuresPage() {
  const adventures = await getAdventures()

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Carte des parcours</Eyebrow>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] lg:items-end">
          <h1 className="max-w-2xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
            Choisissez votre traversée
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Toutes nos aventures se déroulent pour l&apos;instant en Normandie.
            Cliquez sur la région pour zoomer, puis sur un point de départ pour
            ouvrir sa fiche. Les fiches se font défiler à la main.
          </p>
        </div>
      </Container>

      <AdventuresExplorer adventures={adventures} />
    </>
  )
}
