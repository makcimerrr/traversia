import { getPayload } from "payload"
import config from "@payload-config"

import { ADVENTURES } from "../lib/adventures"

/**
 * Injecte le contenu de démonstration dans Payload.
 * Usage : `pnpm seed` (nécessite DATABASE_URI et PAYLOAD_SECRET).
 */
const seed = async () => {
  const payload = await getPayload({ config })

  for (const [index, adventure] of ADVENTURES.entries()) {
    const existing = await payload.find({
      collection: "adventures",
      where: { slug: { equals: adventure.slug } },
      limit: 1,
    })

    const data = {
      slug: adventure.slug,
      spotId: adventure.spotId,
      regionCode: adventure.regionCode,
      title: adventure.title,
      tagline: adventure.tagline,
      ordre: (index + 1) * 10,
      commune: adventure.commune,
      departement: adventure.departement,
      intro: adventure.intro,
      difficulty: String(adventure.difficulty),
      niveau: adventure.niveau,
      distanceKm: adventure.stats.distanceKm,
      randoKm: adventure.stats.randoKm,
      canoeKm: adventure.stats.canoeKm,
      deniveleM: adventure.stats.deniveleM,
      dureeH: adventure.stats.dureeH,
      jours: adventure.stats.jours,
      saison: adventure.saison,
      groupe: adventure.groupe,
      prix: adventure.prix,
      temps_forts: adventure.temps_forts.map((label) => ({ label })),
      programme: adventure.programme,
      inclus: adventure.inclus.map((label) => ({ label })),
    }

    if (existing.docs[0]) {
      await payload.update({ collection: "adventures", id: existing.docs[0].id, data })
      payload.logger.info(`Mise à jour — ${adventure.title}`)
    } else {
      await payload.create({ collection: "adventures", data })
      payload.logger.info(`Création — ${adventure.title}`)
    }
  }

  payload.logger.info(`${ADVENTURES.length} aventures synchronisées.`)
  process.exit(0)
}

await seed()
