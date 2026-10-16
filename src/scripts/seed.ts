import { getPayload, type Where } from "payload"
import config from "../payload.config"

import { ADVENTURES } from "../lib/adventures"
import {
  FAQS_DEMO,
  PAGES_DEMO,
  PARTNERS_DEMO,
  REGIONS_DEMO,
  REVIEWS_DEMO,
  SETTINGS_DEMO,
  slotsDemo,
} from "../lib/demo"
import type { Page } from "../lib/types"
import type { Adventure as AdventureDoc, Page as PageDoc } from "../payload-types"

/**
 * Injecte le contenu de démonstration dans Payload, de façon idempotente :
 * chaque entité est retrouvée par son identifiant naturel (slug, question,
 * aventure + date…) puis créée ou mise à jour.
 *
 * Usage : `pnpm seed` (nécessite DATABASE_URL et PAYLOAD_SECRET).
 */

type CollectionSlug = "regions" | "partners" | "adventures" | "slots" | "faqs" | "reviews" | "pages"

const payload = await getPayload({ config })
const log = (message: string) => payload.logger.info(message)

/** Crée ou met à jour, et renvoie l'id. */
async function upsert(
  collection: CollectionSlug,
  where: Where,
  data: Record<string, unknown>,
  label: string,
): Promise<number> {
  const existing = await payload.find({ collection, where, limit: 1, depth: 0 })
  const found = existing.docs[0]
  if (found) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection, id: found.id, data: data as any })
    log(`Mise à jour — ${label}`)
    return found.id
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await payload.create({ collection, data: data as any })
  log(`Création — ${label}`)
  return created.id
}

const labelled = (items: string[]) => items.map((label) => ({ label }))

/** Construit un état Lexical minimal (titres h2 + paragraphes) à partir des blocs de démo. */
function lexicalFromBlocks(body: Page["body"]): PageDoc["content"] {
  if (body.kind === "lexical") return body.data as PageDoc["content"]
  const text = (t: string) => ({
    type: "text",
    version: 1,
    text: t,
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
  })
  const children = body.blocks.flatMap((block) => [
    ...(block.heading
      ? [{ type: "heading", tag: "h2", version: 1, direction: "ltr", format: "", indent: 0, children: [text(block.heading)] }]
      : []),
    ...block.paragraphs.map((p) => ({
      type: "paragraph",
      version: 1,
      direction: "ltr",
      format: "",
      indent: 0,
      textFormat: 0,
      textStyle: "",
      children: [text(p)],
    })),
  ])
  return {
    root: { type: "root", version: 1, direction: "ltr", format: "", indent: 0, children },
  } as PageDoc["content"]
}

// --- Régions ----------------------------------------------------------------
const regionIds = new Map<string, number>()
for (const [i, region] of REGIONS_DEMO.entries()) {
  const id = await upsert(
    "regions",
    { slug: { equals: region.slug } },
    { ...region, ordre: (i + 1) * 10 },
    region.name,
  )
  regionIds.set(region.slug, id)
}

// --- Partenaires ------------------------------------------------------------
const partnerIds = new Map<string, number>()
for (const partner of PARTNERS_DEMO) {
  const { regionSlugs, logo: _logo, ...rest } = partner
  void _logo
  const id = await upsert(
    "partners",
    { slug: { equals: partner.slug } },
    { ...rest, regions: regionSlugs.map((s) => regionIds.get(s)).filter(Boolean) },
    partner.name,
  )
  partnerIds.set(partner.slug, id)
}

// --- Aventures --------------------------------------------------------------
const adventureIds = new Map<string, number>()
for (const [index, adventure] of ADVENTURES.entries()) {
  const id = await upsert(
    "adventures",
    { slug: { equals: adventure.slug } },
    {
      slug: adventure.slug,
      spotId: adventure.spotId as AdventureDoc["spotId"],
      region: regionIds.get(adventure.regionSlug),
      partner: adventure.partnerSlug ? partnerIds.get(adventure.partnerSlug) : undefined,
      title: adventure.title,
      tagline: adventure.tagline,
      actif: true,
      ordre: (index + 1) * 10,
      commune: adventure.commune,
      departement: adventure.departement,
      rendezVous: adventure.rendezVous,
      intro: adventure.intro,
      difficulty: String(adventure.difficulty) as AdventureDoc["difficulty"],
      niveauConseille: adventure.niveauConseille,
      ageMin: adventure.ageMin,
      distanceKm: adventure.stats.distanceKm,
      randoKm: adventure.stats.randoKm,
      canoeKm: adventure.stats.canoeKm,
      deniveleM: adventure.stats.deniveleM,
      dureeH: adventure.stats.dureeH,
      jours: adventure.stats.jours,
      tempsRandoH: adventure.stats.tempsRandoH,
      tempsCanoeH: adventure.stats.tempsCanoeH,
      saison: adventure.saison,
      groupe: adventure.groupe,
      prix: adventure.prix,
      prixEnfant: adventure.prixEnfant,
      ageEnfantMax: adventure.ageEnfantMax,
      placesParDefaut: adventure.placesParDefaut,
      minParticipants: adventure.minParticipants,
      maxParticipants: adventure.maxParticipants,
      temps_forts: labelled(adventure.temps_forts),
      programme: adventure.programme,
      inclus: labelled(adventure.inclus),
      nonInclus: labelled(adventure.nonInclus),
      equipement: labelled(adventure.equipement),
      pratique: adventure.pratique,
    },
    adventure.title,
  )
  adventureIds.set(adventure.slug, id)
}

// --- Créneaux ---------------------------------------------------------------
// Un créneau existant (même aventure, même date) est conservé tel quel, pour
// ne jamais écraser un stock réel.
let createdSlots = 0
for (const slot of slotsDemo()) {
  const adventure = adventureIds.get(slot.adventureSlug)
  const partner = partnerIds.get(slot.partnerSlug)
  if (!adventure || !partner) continue
  const date = `${slot.date}T12:00:00.000Z`
  const existing = await payload.find({
    collection: "slots",
    where: {
      and: [
        { adventure: { equals: adventure } },
        { date: { greater_than_equal: `${slot.date}T00:00:00.000Z` } },
        { date: { less_than: `${slot.date}T23:59:59.999Z` } },
      ],
    },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) continue
  await payload.create({
    collection: "slots",
    data: {
      adventure,
      partner,
      date,
      heure: slot.heure,
      places: slot.places,
      placesReservees: slot.placesReservees,
      statut: slot.statut,
    },
  })
  createdSlots++
}
log(`${createdSlots} créneaux créés.`)

// --- FAQ --------------------------------------------------------------------
for (const [i, faq] of FAQS_DEMO.entries()) {
  await upsert(
    "faqs",
    { question: { equals: faq.question } },
    {
      question: faq.question,
      reponse: faq.reponse,
      categorie: faq.categorie,
      general: faq.general,
      publie: true,
      ordre: (i + 1) * 10,
      adventures: faq.adventureSlugs.map((s) => adventureIds.get(s)).filter(Boolean),
    },
    faq.question,
  )
}

// --- Avis -------------------------------------------------------------------
for (const review of REVIEWS_DEMO) {
  await upsert(
    "reviews",
    { and: [{ auteur: { equals: review.auteur } }, { texte: { equals: review.texte } }] },
    {
      auteur: review.auteur,
      note: String(review.note),
      texte: review.texte,
      date: `${review.date}T12:00:00.000Z`,
      publie: true,
      adventure: review.adventureSlug ? adventureIds.get(review.adventureSlug) : undefined,
    },
    `Avis de ${review.auteur}`,
  )
}

// --- Pages ------------------------------------------------------------------
// Une page déjà présente n'est pas réécrite : son contenu a pu être édité.
for (const page of PAGES_DEMO) {
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: page.slug } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) {
    log(`Conservée — ${page.title}`)
    continue
  }
  await payload.create({
    collection: "pages",
    data: {
      slug: page.slug,
      title: page.title,
      description: page.description,
      publie: true,
      content: lexicalFromBlocks(page.body),
    },
  })
  log(`Création — ${page.title}`)
}

// --- Paramètres -------------------------------------------------------------
const settings = await payload.findGlobal({ slug: "site-settings", depth: 0 })
if (!settings?.email) {
  await payload.updateGlobal({ slug: "site-settings", data: SETTINGS_DEMO })
  log("Paramètres du site initialisés.")
} else {
  log("Paramètres du site conservés.")
}

log("Contenu de démonstration synchronisé.")
process.exit(0)
