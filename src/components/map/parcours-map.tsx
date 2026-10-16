"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"

import { placeSteps, schematicTrace, traceToGeo } from "@/lib/trace"
import type { Adventure } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Fond de carte réel autour d'un parcours : tuiles CARTO (données
 * OpenStreetMap) passées en monochrome, tracé schématique et étapes par
 * dessus. Leaflet n'est chargé que dans le navigateur.
 *
 * Tant qu'aucune trace GPX n'est fournie, la boucle dessinée est celle de
 * src/lib/trace.ts, calée sur le point de rendez-vous.
 */

const TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

export function ParcoursMap({
  adventure,
  className,
  interactive = true,
}: {
  adventure: Adventure
  className?: string
  interactive?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { lat, lng } = adventure.rendezVous

  useEffect(() => {
    const el = ref.current
    if (!el || lat === undefined || lng === undefined) return
    let cancelled = false
    let map: import("leaflet").Map | undefined

    import("leaflet").then((L) => {
      if (cancelled || !el) return
      const m = L.map(el, {
        zoomControl: interactive,
        scrollWheelZoom: false,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        keyboard: interactive,
        attributionControl: true,
      })
      map = m
      L.tileLayer(TILES, { attribution: ATTRIBUTION, subdomains: "abcd", maxZoom: 19 }).addTo(m)
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(m)

      const trace = schematicTrace(adventure)
      const geo = traceToGeo(trace, { lat, lng }, adventure.spotId)
      const stroke = getComputedStyle(el).color || "#111"

      L.polyline(geo.river, { color: stroke, weight: 6, opacity: 0.12, lineJoin: "round" }).addTo(m)
      L.polyline(geo.hike, { color: stroke, weight: 2.5, dashArray: "6 6", lineJoin: "round" }).addTo(m)
      L.polyline(geo.canoe, { color: stroke, weight: 3.5, lineJoin: "round" }).addTo(m)

      const icon = (kind: "start" | "step" | "end", label: string) =>
        L.divIcon({
          className: "parcours-step",
          html: `<span class="parcours-step__dot parcours-step__dot--${kind}"></span><span class="parcours-step__label">${label}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })
      const steps = placeSteps(trace, adventure.programme)
      steps.forEach((step, i) => {
        const kind = i === 0 ? "start" : i === steps.length - 1 ? "end" : "step"
        const text = `${step.time} — ${step.title}`.replace(/</g, "&lt;")
        L.marker(geo.toGeo(step.at), { icon: icon(kind, text), interactive: false, keyboard: false }).addTo(m)
      })
      if (steps.length === 0) {
        L.marker([lat, lng], { icon: icon("start", adventure.rendezVous.lieu || "Départ"), interactive: false }).addTo(m)
      }

      m.fitBounds(L.latLngBounds([...geo.hike, ...geo.canoe]), { padding: [40, 40] })
      // Le défilement ne zoome qu'après un clic, pour ne pas piéger la page.
      if (interactive) m.once("click", () => m.scrollWheelZoom.enable())
    })

    return () => {
      cancelled = true
      map?.remove()
    }
  }, [adventure, lat, lng, interactive])

  if (lat === undefined || lng === undefined) return null

  return (
    <div
      ref={ref}
      className={cn("parcours-map relative isolate h-full w-full text-foreground", className)}
      role="region"
      aria-label={`Carte du parcours ${adventure.title}`}
    />
  )
}
