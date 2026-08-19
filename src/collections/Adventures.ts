import type { CollectionConfig } from "payload"

/**
 * Un « pack aventure » : le contenu éditorial d'un parcours.
 * La forme suit exactement le type `Adventure` de src/lib/types.ts,
 * pour que le front puisse basculer de la donnée de démo à Payload
 * sans changer de composants.
 */
export const Adventures: CollectionConfig = {
  slug: "adventures",
  admin: {
    group: "Contenu",
    useAsTitle: "title",
    defaultColumns: ["title", "commune", "difficulty", "prix"],
  },
  labels: { singular: "Aventure", plural: "Aventures" },
  access: { read: () => true },
  defaultSort: "ordre",
  fields: [
    {
      type: "row",
      fields: [
        { name: "title", type: "text", required: true, label: "Titre", admin: { width: "60%" } },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          label: "Identifiant d'URL",
          admin: { width: "40%" },
        },
      ],
    },
    {
      name: "tagline",
      type: "text",
      required: true,
      label: "Accroche",
      admin: { description: "Une ligne, affichée sur la carte-fiche." },
    },
    {
      name: "ordre",
      type: "number",
      required: true,
      defaultValue: 100,
      label: "Ordre d'affichage",
    },

    {
      type: "tabs",
      tabs: [
        {
          label: "Localisation",
          fields: [
            {
              type: "row",
              fields: [
                { name: "commune", type: "text", required: true, label: "Commune" },
                { name: "departement", type: "text", required: true, label: "Département" },
              ],
            },
            {
              name: "regionCode",
              type: "select",
              required: true,
              defaultValue: "28",
              label: "Région",
              options: [{ label: "Normandie", value: "28" }],
            },
            {
              name: "spotId",
              type: "select",
              required: true,
              label: "Point de départ sur la carte",
              admin: {
                description:
                  "Correspond à une clé de SPOT_XY dans src/lib/france-map.ts.",
              },
              options: [
                { label: "Clécy — Suisse Normande", value: "clecy-suisse-normande" },
                { label: "Pont-d'Ouilly — Roche d'Oëtre", value: "pont-douilly-oetre" },
                { label: "Les Andelys — Seine", value: "les-andelys-seine" },
                { label: "Étretat — Côte d'Albâtre", value: "etretat-albatre" },
                { label: "Genêts — Baie du Mont", value: "baie-mont-saint-michel" },
                { label: "Acquigny — Vallée de l'Eure", value: "vallee-de-leure" },
                { label: "Vire — Souleuvre", value: "vire-souleuvre" },
              ],
            },
          ],
        },
        {
          label: "Mesures",
          fields: [
            {
              type: "row",
              fields: [
                { name: "distanceKm", type: "number", required: true, label: "Distance totale (km)" },
                { name: "deniveleM", type: "number", required: true, label: "Dénivelé positif (m)" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "randoKm", type: "number", required: true, label: "Dont randonnée (km)" },
                { name: "canoeKm", type: "number", required: true, label: "Dont canoë (km)" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "dureeH", type: "number", required: true, label: "Durée sur le terrain (h)" },
                { name: "jours", type: "number", required: true, defaultValue: 1, label: "Nombre de jours" },
              ],
            },
            {
              name: "difficulty",
              type: "select",
              required: true,
              label: "Difficulté",
              options: [
                { label: "1 — Découverte", value: "1" },
                { label: "2 — Facile", value: "2" },
                { label: "3 — Soutenu", value: "3" },
                { label: "4 — Sportif", value: "4" },
                { label: "5 — Engagé", value: "5" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "saison", type: "text", required: true, label: "Saison" },
                { name: "groupe", type: "text", required: true, label: "Taille du groupe" },
                { name: "prix", type: "number", required: true, label: "Prix (€ / pers.)" },
              ],
            },
          ],
        },
        {
          label: "Récit",
          fields: [
            {
              name: "intro",
              type: "textarea",
              required: true,
              label: "Présentation",
              admin: { description: "Deux à quatre phrases : donner envie, pas tout dire." },
            },
            {
              name: "temps_forts",
              type: "array",
              label: "Temps forts",
              minRows: 1,
              labels: { singular: "Temps fort", plural: "Temps forts" },
              fields: [{ name: "label", type: "text", required: true, label: "Intitulé" }],
            },
            {
              name: "programme",
              type: "array",
              label: "Déroulé",
              labels: { singular: "Étape", plural: "Étapes" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "time", type: "text", required: true, label: "Repère horaire" },
                    { name: "title", type: "text", required: true, label: "Titre" },
                  ],
                },
                { name: "detail", type: "textarea", required: true, label: "Détail" },
              ],
            },
            {
              name: "inclus",
              type: "array",
              label: "Ce qui est compris",
              labels: { singular: "Élément", plural: "Éléments" },
              fields: [{ name: "label", type: "text", required: true, label: "Intitulé" }],
            },
          ],
        },
        {
          label: "Visuels",
          fields: [
            {
              name: "cover",
              type: "upload",
              relationTo: "media",
              label: "Image principale",
            },
            {
              name: "gallery",
              type: "upload",
              relationTo: "media",
              hasMany: true,
              label: "Galerie",
            },
          ],
        },
      ],
    },
  ],
}
