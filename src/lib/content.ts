import "server-only"

import { ADVENTURES } from "./adventures"
import type { Adventure, Difficulty } from "./types"

/**
 * Point d'entrée unique du contenu.
 *
 * Tant qu'aucune base n'est configurée (DATABASE_URI absent), le site sert
 * les données de démonstration : `pnpm dev` fonctionne sans rien installer.
 * Dès que Payload est branché, les mêmes pages lisent la collection
 * `adventures` sans qu'aucun composant ne change.
 */

const usePayload = Boolean(
  (process.env.DATABASE_URI || process.env.DATABASE_URL) && process.env.PAYLOAD_SECRET,
)

type ArrayItem = { label?: string | null }

/** Convertit un document Payload vers le type utilisé par les composants. */
function toAdventure(doc: Record<string, unknown>): Adventure {
  const list = (value: unknown): string[] =>
    Array.isArray(value)
      ? (value as ArrayItem[]).map((item) => item.label ?? "").filter(Boolean)
      : []

  const num = (value: unknown): number => Number(value ?? 0)

  return {
    slug: String(doc.slug),
    spotId: String(doc.spotId),
    regionCode: String(doc.regionCode ?? "28"),
    title: String(doc.title),
    tagline: String(doc.tagline ?? ""),
    commune: String(doc.commune ?? ""),
    departement: String(doc.departement ?? ""),
    intro: String(doc.intro ?? ""),
    difficulty: (Number(doc.difficulty) || 1) as Difficulty,
    niveau: String(doc.niveau ?? ""),
    stats: {
      distanceKm: num(doc.distanceKm),
      randoKm: num(doc.randoKm),
      canoeKm: num(doc.canoeKm),
      deniveleM: num(doc.deniveleM),
      dureeH: num(doc.dureeH),
      jours: num(doc.jours) || 1,
    },
    saison: String(doc.saison ?? ""),
    groupe: String(doc.groupe ?? ""),
    prix: num(doc.prix),
    temps_forts: list(doc.temps_forts),
    programme: Array.isArray(doc.programme)
      ? (doc.programme as Record<string, unknown>[]).map((step) => ({
          time: String(step.time ?? ""),
          title: String(step.title ?? ""),
          detail: String(step.detail ?? ""),
        }))
      : [],
    inclus: list(doc.inclus),
  }
}

export async function getAdventures(): Promise<Adventure[]> {
  if (!usePayload) return ADVENTURES

  try {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import("payload"),
      import("@payload-config"),
    ])
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "adventures",
      limit: 100,
      sort: "ordre",
      depth: 1,
    })
    if (docs.length === 0) return ADVENTURES
    return docs.map((doc) => toAdventure(doc as unknown as Record<string, unknown>))
  } catch (error) {
    // Un site vitrine ne doit pas tomber parce que la base est injoignable.
    console.warn("[content] Payload indisponible, contenu de démo servi.", error)
    return ADVENTURES
  }
}

export async function getAdventure(slug: string): Promise<Adventure | undefined> {
  const all = await getAdventures()
  return all.find((a) => a.slug === slug)
}
