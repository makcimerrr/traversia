import "server-only"

import type { Payload, Where } from "payload"

import { ADVENTURES } from "./adventures"
import {
  FAQS_DEMO,
  PAGES_DEMO,
  PARTNERS_DEMO,
  POSTS_DEMO,
  REGIONS_DEMO,
  REVIEWS_DEMO,
  SETTINGS_DEMO,
  slotsDemo,
  toDateKey,
} from "./demo"
import { readOrDemo } from "./payload"
import type {
  Adventure as AdventureDoc,
  Faq as FaqDoc,
  Media as MediaDoc,
  Page as PageDoc,
  Partner as PartnerDoc,
  Post as PostDoc,
  Region as RegionDoc,
  Review as ReviewDoc,
  SiteSetting as SettingsDoc,
  Slot as SlotDoc,
} from "@/payload-types"
import type {
  Adventure,
  Difficulty,
  Faq,
  MediaRef,
  Page,
  Partner,
  Post,
  Region,
  Review,
  SiteSettings,
  Slot,
} from "./types"
import { DIFFICULTY_LABELS } from "./types"

/**
 * Point d'entrée unique du contenu.
 *
 * Chaque lecteur interroge Payload quand une base est configurée, et sert
 * sinon le contenu de démonstration (src/lib/adventures.ts, src/lib/demo.ts).
 * Les composants ne voient jamais la différence.
 */

// ----------------------------------------------------------------------------
// Conversions Payload → domaine
// ----------------------------------------------------------------------------

type Labelled = { label?: string | null }

const labels = (value: Labelled[] | null | undefined): string[] =>
  (value ?? []).map((item) => item.label ?? "").filter(Boolean)

const num = (value: number | null | undefined, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback

/** Une relation peuplée (depth ≥ 1), ou rien si Payload n'a renvoyé que l'id. */
function populated<T extends { id: number }>(value: number | T | null | undefined): T | undefined {
  return value && typeof value === "object" ? value : undefined
}

function toMedia(value: number | MediaDoc | null | undefined): MediaRef | undefined {
  const doc = populated(value)
  if (!doc?.url) return undefined
  return {
    url: doc.url,
    alt: doc.alt,
    width: doc.width ?? undefined,
    height: doc.height ?? undefined,
    cardUrl: doc.sizes?.card?.url ?? undefined,
  }
}

export function toAdventure(doc: AdventureDoc): Adventure {
  const region = populated(doc.region)
  const partner = populated(doc.partner)
  const difficulty = (Number(doc.difficulty) || 1) as Difficulty

  return {
    slug: doc.slug,
    spotId: doc.spotId,
    regionCode: region?.code ?? "28",
    regionSlug: region?.slug ?? "normandie",
    regionName: region?.name ?? "Normandie",
    partnerSlug: partner?.slug,
    partnerName: partner?.name,
    title: doc.title,
    tagline: doc.tagline,
    commune: doc.commune,
    departement: doc.departement,
    intro: doc.intro,
    difficulty,
    niveau: DIFFICULTY_LABELS[difficulty],
    niveauConseille: doc.niveauConseille ?? "",
    ageMin: num(doc.ageMin, 8),
    stats: {
      distanceKm: num(doc.distanceKm),
      randoKm: num(doc.randoKm),
      canoeKm: num(doc.canoeKm),
      deniveleM: num(doc.deniveleM),
      dureeH: num(doc.dureeH),
      jours: num(doc.jours, 1),
      tempsRandoH: num(doc.tempsRandoH),
      tempsCanoeH: num(doc.tempsCanoeH),
    },
    saison: doc.saison,
    groupe: doc.groupe,
    prix: num(doc.prix),
    prixEnfant: doc.prixEnfant ?? undefined,
    ageEnfantMax: num(doc.ageEnfantMax, 12),
    placesParDefaut: num(doc.placesParDefaut, 12),
    minParticipants: num(doc.minParticipants, 1),
    maxParticipants: num(doc.maxParticipants, 8),
    temps_forts: labels(doc.temps_forts),
    programme: (doc.programme ?? []).map((step) => ({
      time: step.time,
      title: step.title,
      detail: step.detail,
    })),
    inclus: labels(doc.inclus),
    nonInclus: labels(doc.nonInclus),
    equipement: labels(doc.equipement),
    pratique: (doc.pratique ?? []).map((item) => ({ label: item.label, detail: item.detail })),
    rendezVous: {
      lieu: doc.rendezVous?.lieu ?? "",
      adresse: doc.rendezVous?.adresse ?? "",
      lat: doc.rendezVous?.lat ?? undefined,
      lng: doc.rendezVous?.lng ?? undefined,
      heure: doc.rendezVous?.heure ?? "",
    },
    cover: toMedia(doc.cover),
    gallery: (doc.gallery ?? []).map(toMedia).filter((m): m is MediaRef => Boolean(m)),
    gpx: toMedia(doc.gpx),
  }
}

function toRegion(doc: RegionDoc): Region {
  return {
    slug: doc.slug,
    code: doc.code,
    name: doc.name,
    description: doc.description ?? "",
    active: doc.active ?? true,
  }
}

function toPartner(doc: PartnerDoc): Partner {
  return {
    slug: doc.slug,
    name: doc.name,
    tagline: doc.tagline ?? "",
    description: doc.description ?? "",
    commune: doc.commune,
    departement: doc.departement ?? "",
    adresse: doc.adresse ?? "",
    website: doc.website ?? undefined,
    telephone: doc.telephone ?? undefined,
    regionSlugs: (doc.regions ?? [])
      .map((r) => populated(r)?.slug)
      .filter((s): s is string => Boolean(s)),
    logo: toMedia(doc.logo),
    active: doc.active ?? true,
  }
}

export function toSlot(doc: SlotDoc): Slot | undefined {
  const adventure = populated(doc.adventure)
  const partner = populated(doc.partner)
  if (!adventure || !partner) return undefined
  const places = num(doc.places)
  const placesReservees = num(doc.placesReservees)
  return {
    id: String(doc.id),
    adventureSlug: adventure.slug,
    partnerSlug: partner.slug,
    partnerName: partner.name,
    date: toDateKey(new Date(doc.date)),
    heure: doc.heure || adventure.rendezVous?.heure || "",
    places,
    placesReservees,
    placesRestantes: Math.max(0, places - placesReservees),
    prix: doc.prix ?? adventure.prix,
    statut: doc.statut,
  }
}

function toFaq(doc: FaqDoc): Faq {
  return {
    id: String(doc.id),
    question: doc.question,
    reponse: doc.reponse,
    categorie: doc.categorie,
    general: doc.general ?? true,
    adventureSlugs: (doc.adventures ?? [])
      .map((a) => populated(a)?.slug)
      .filter((s): s is string => Boolean(s)),
  }
}

function toReview(doc: ReviewDoc): Review {
  return {
    id: String(doc.id),
    auteur: doc.auteur,
    note: (Number(doc.note) || 5) as Review["note"],
    texte: doc.texte,
    date: toDateKey(new Date(doc.date)),
    adventureSlug: populated(doc.adventure)?.slug,
  }
}

function toPage(doc: PageDoc): Page {
  return {
    slug: doc.slug,
    title: doc.title,
    description: doc.description ?? "",
    body: { kind: "lexical", data: doc.content },
    updatedAt: toDateKey(new Date(doc.updatedAt)),
  }
}

function toPost(doc: PostDoc): Post {
  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    publishedAt: toDateKey(new Date(doc.publishedAt)),
    tags: doc.tags ?? [],
    cover: toMedia(doc.cover),
    body: { kind: "lexical", data: doc.content },
    adventureSlugs: (doc.adventures ?? []).map((a) => populated(a)?.slug).filter((s): s is string => Boolean(s)),
  }
}

function toSettings(doc: SettingsDoc): SiteSettings {
  const text = (value: string | null | undefined, fallback = "") => value ?? fallback
  return {
    email: doc.email || SETTINGS_DEMO.email,
    telephone: text(doc.telephone),
    adresse: text(doc.adresse),
    horaires: text(doc.horaires),
    instagram: doc.instagram ?? undefined,
    facebook: doc.facebook ?? undefined,
    raisonSociale: text(doc.raisonSociale),
    formeJuridique: text(doc.formeJuridique),
    capital: text(doc.capital),
    siret: text(doc.siret),
    tva: text(doc.tva),
    siegeSocial: text(doc.siegeSocial),
    directeurPublication: text(doc.directeurPublication),
    immatriculationTourisme: text(doc.immatriculationTourisme),
    assuranceRc: text(doc.assuranceRc),
    delaiAnnulationJours: num(doc.delaiAnnulationJours, 7),
    messageAccueil: text(doc.messageAccueil),
    gaId: doc.gaId ?? undefined,
    metaPixelId: doc.metaPixelId ?? undefined,
    googleSiteVerification: doc.googleSiteVerification ?? undefined,
  }
}

// ----------------------------------------------------------------------------
// Aventures
// ----------------------------------------------------------------------------

export async function getAdventures(): Promise<Adventure[]> {
  return readOrDemo(
    "adventures",
    async (payload) => {
      const { docs } = await payload.find({
        collection: "adventures",
        where: { actif: { not_equals: false } },
        limit: 100,
        sort: "ordre",
        depth: 1,
      })
      return docs.length ? docs.map(toAdventure) : ADVENTURES
    },
    () => ADVENTURES,
  )
}

export async function getAdventure(slug: string): Promise<Adventure | undefined> {
  const all = await getAdventures()
  return all.find((a) => a.slug === slug)
}

// ----------------------------------------------------------------------------
// Réseau : régions et partenaires
// ----------------------------------------------------------------------------

export async function getRegions(): Promise<Region[]> {
  return readOrDemo(
    "regions",
    async (payload) => {
      const { docs } = await payload.find({ collection: "regions", limit: 50, sort: "ordre", depth: 0 })
      return docs.length ? docs.map(toRegion) : REGIONS_DEMO
    },
    () => REGIONS_DEMO,
  )
}

export async function getPartners(): Promise<Partner[]> {
  return readOrDemo(
    "partners",
    async (payload) => {
      const { docs } = await payload.find({
        collection: "partners",
        where: { active: { not_equals: false } },
        limit: 100,
        sort: "name",
        depth: 1,
      })
      return docs.length ? docs.map(toPartner) : PARTNERS_DEMO
    },
    () => PARTNERS_DEMO.filter((p) => p.active),
  )
}

export async function getPartner(slug: string): Promise<Partner | undefined> {
  const all = await getPartners()
  return all.find((p) => p.slug === slug)
}

// ----------------------------------------------------------------------------
// Créneaux
// ----------------------------------------------------------------------------

type SlotQuery = {
  adventureSlug?: string
  /** Inclure les créneaux complets (pour les afficher barrés). */
  includeFull?: boolean
  /** Date de début (incluse), AAAA-MM-JJ. Par défaut aujourd'hui. */
  from?: string
  limit?: number
}

const slotStatuses = (includeFull: boolean) => (includeFull ? ["ouvert", "complet"] : ["ouvert"])

function filterDemoSlots(query: SlotQuery): Slot[] {
  const from = query.from ?? toDateKey(new Date())
  const statuses = slotStatuses(query.includeFull ?? true)
  return slotsDemo()
    .filter((s) => s.date >= from)
    .filter((s) => !query.adventureSlug || s.adventureSlug === query.adventureSlug)
    .filter((s) => statuses.includes(s.statut))
    .slice(0, query.limit ?? 200)
}

/** Créneaux à venir, triés par date. Les créneaux fermés ou annulés ne sortent jamais. */
export async function getSlots(query: SlotQuery = {}): Promise<Slot[]> {
  return readOrDemo(
    "slots",
    async (payload) => {
      const from = query.from ?? toDateKey(new Date())
      const where: Where = {
        and: [
          { date: { greater_than_equal: `${from}T00:00:00.000Z` } },
          { statut: { in: slotStatuses(query.includeFull ?? true) } },
          { "partner.active": { not_equals: false } },
        ],
      }
      if (query.adventureSlug) {
        where.and!.push({ "adventure.slug": { equals: query.adventureSlug } })
      }
      const { docs } = await payload.find({
        collection: "slots",
        where,
        limit: query.limit ?? 200,
        sort: "date",
        depth: 1,
      })
      return docs.map(toSlot).filter((s): s is Slot => Boolean(s))
    },
    () => filterDemoSlots(query),
  )
}

export async function getSlot(id: string): Promise<Slot | undefined> {
  return readOrDemo(
    "slot",
    async (payload) => {
      const doc = await payload.findByID({ collection: "slots", id, depth: 1 })
      return toSlot(doc)
    },
    () => slotsDemo().find((s) => s.id === id),
  )
}

// ----------------------------------------------------------------------------
// FAQ, avis, pages, paramètres
// ----------------------------------------------------------------------------

export async function getFaqs(options: { adventureSlug?: string; general?: boolean } = {}): Promise<Faq[]> {
  const pick = (faqs: Faq[]) =>
    faqs.filter((f) => {
      if (options.adventureSlug) return f.adventureSlugs.includes(options.adventureSlug)
      if (options.general) return f.general
      return true
    })

  return readOrDemo(
    "faqs",
    async (payload) => {
      const { docs } = await payload.find({
        collection: "faqs",
        where: { publie: { not_equals: false } },
        limit: 200,
        sort: "ordre",
        depth: 1,
      })
      return pick(docs.length ? docs.map(toFaq) : FAQS_DEMO)
    },
    () => pick(FAQS_DEMO),
  )
}

export async function getReviews(adventureSlug?: string): Promise<Review[]> {
  const pick = (reviews: Review[]) =>
    adventureSlug ? reviews.filter((r) => r.adventureSlug === adventureSlug) : reviews

  return readOrDemo(
    "reviews",
    async (payload) => {
      const { docs } = await payload.find({
        collection: "reviews",
        where: { publie: { equals: true } },
        limit: 200,
        sort: "-date",
        depth: 1,
      })
      return pick(docs.map(toReview))
    },
    () => pick(REVIEWS_DEMO),
  )
}

export async function getPages(): Promise<Page[]> {
  return readOrDemo(
    "pages",
    async (payload) => {
      const { docs } = await payload.find({
        collection: "pages",
        where: { publie: { not_equals: false } },
        limit: 100,
        depth: 0,
      })
      return docs.length ? docs.map(toPage) : PAGES_DEMO
    },
    () => PAGES_DEMO,
  )
}

export async function getPage(slug: string): Promise<Page | undefined> {
  const pages = await getPages()
  return pages.find((p) => p.slug === slug)
}

export async function getPosts(): Promise<Post[]> {
  const today = toDateKey(new Date())
  return readOrDemo(
    "posts",
    async (payload) => {
      const { docs } = await payload.find({
        collection: "posts",
        where: { and: [{ publie: { equals: true } }, { publishedAt: { less_than_equal: `${today}T23:59:59.999Z` } }] },
        limit: 100,
        sort: "-publishedAt",
        depth: 1,
      })
      return docs.length ? docs.map(toPost) : POSTS_DEMO
    },
    () => POSTS_DEMO,
  )
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const posts = await getPosts()
  return posts.find((p) => p.slug === slug)
}

export async function getSettings(): Promise<SiteSettings> {
  return readOrDemo(
    "site-settings",
    async (payload: Payload) => {
      const doc = await payload.findGlobal({ slug: "site-settings", depth: 0 })
      return doc?.email ? toSettings(doc) : SETTINGS_DEMO
    },
    () => SETTINGS_DEMO,
  )
}
