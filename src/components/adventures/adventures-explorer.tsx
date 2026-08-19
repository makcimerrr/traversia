"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, MapPin } from "lucide-react"

import { AdventureMap } from "@/components/map/adventure-map"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import type { Adventure } from "@/lib/types"
import { AdventureCard } from "./adventure-card"

export function AdventuresExplorer({ adventures }: { adventures: Adventure[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  // Le carrousel est la source de vérité de la sélection ; la carte s'y aligne.
  useEffect(() => {
    if (!api) return
    const sync = () => setIndex(api.selectedScrollSnap())
    api.on("select", sync)
    sync()
    return () => {
      api.off("select", sync)
    }
  }, [api])

  const selectFromMap = useCallback(
    (slug: string) => {
      const next = adventures.findIndex((a) => a.slug === slug)
      if (next < 0) return
      setIndex(next)
      api?.scrollTo(next)
    },
    [adventures, api],
  )

  const selected = zoomed ? (adventures[index]?.slug ?? null) : null

  return (
    <div className="border-t border-border">
      {/* Fil d'Ariane cartographique. */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
        <p className="label text-muted-foreground">
          France
          <span className="mx-2 text-foreground">/</span>
          <span className={zoomed ? "text-foreground" : ""}>Normandie</span>
        </p>
        <button
          type="button"
          onClick={() => setZoomed(false)}
          disabled={!zoomed}
          className="inline-flex items-center gap-2 label text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ArrowLeft className="size-3.5" />
          Vue France
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_minmax(0,0.9fr)]">
        <div className="relative min-w-0 border-b border-border lg:border-b-0 lg:border-r">
          <AdventureMap
            adventures={adventures}
            selectedSlug={selected}
            zoomed={zoomed}
            onSelect={selectFromMap}
            onZoom={() => setZoomed(true)}
            className="aspect-square w-full sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-[640px]"
          />
        </div>

        {/* ---- Panneau des fiches ---- */}
        <div className="flex min-w-0 flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
          {!zoomed ? (
            <div className="mx-auto max-w-sm text-center">
              <MapPin className="mx-auto size-5" strokeWidth={1.5} />
              <h2 className="mt-5 text-3xl">Une seule région, pour l&apos;instant</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Nos {adventures.length} packs aventure se déroulent tous en
                Normandie, entre le bocage, les vallées de l&apos;Orne et de la
                Seine, et la côte d&apos;Albâtre. Cliquez sur la zone hachurée pour
                les découvrir.
              </p>
              <button
                type="button"
                onClick={() => setZoomed(true)}
                className="mt-8 w-full border border-foreground bg-foreground px-5 py-4 label text-background transition-colors hover:bg-background hover:text-foreground"
              >
                Explorer la Normandie
              </button>
              <p className="mt-8 label-sm text-muted-foreground">
                Bretagne et Massif central — 2027
              </p>
            </div>
          ) : (
            <Carousel
              setApi={setApi}
              opts={{ align: "start", containScroll: "trimSnaps" }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {adventures.map((adventure, i) => (
                  <CarouselItem
                    key={adventure.slug}
                    className="basis-[88%] pl-4 sm:basis-[62%] lg:basis-full"
                  >
                    <AdventureCard
                      adventure={adventure}
                      index={i}
                      active={i === index}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="shrink-0 label text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")} / {String(adventures.length).padStart(2, "0")}
                </p>

                {/* Pagination cliquable, qui double la lecture de la carte. */}
                <div className="hidden items-center gap-1.5 sm:flex">
                  {adventures.map((adventure, i) => (
                    <button
                      key={adventure.slug}
                      type="button"
                      aria-label={`Aller au parcours ${adventure.title}`}
                      aria-current={i === index}
                      onClick={() => api?.scrollTo(i)}
                      className="group px-0.5 py-2"
                    >
                      <span
                        className={
                          i === index
                            ? "block h-px w-8 bg-foreground transition-all"
                            : "block h-px w-4 bg-border transition-all group-hover:bg-foreground"
                        }
                      />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <CarouselPrevious className="static size-9 translate-y-0 rounded-none border-border" />
                  <CarouselNext className="static size-9 translate-y-0 rounded-none border-border" />
                </div>
              </div>

              <p className="mt-4 label-sm text-muted-foreground">
                <span className="sm:hidden">Glissez les fiches</span>
                <span className="hidden sm:inline">
                  Glissez les fiches ou cliquez un point sur la carte
                </span>
              </p>
            </Carousel>
          )}
        </div>
      </div>
    </div>
  )
}
