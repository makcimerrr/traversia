import type { CollectionConfig } from "payload"

import { revalidateHooks } from "../lib/revalidate"

const labelList = (name: string, label: string, description?: string) => ({
  name,
  type: "array" as const,
  label,
  labels: { singular: "Élément", plural: "Éléments" },
  admin: description ? { description } : undefined,
  fields: [{ name: "label", type: "text" as const, required: true, label: "Intitulé" }],
})

/**
 * Un « pack aventure » : l'itinéraire, son récit, ses mesures, ses tarifs.
 * Les dates se gèrent dans la collection Créneaux, les partenaires dans
 * Partenaires ; cette fiche décrit le parcours, pas son exploitation.
 */
export const Adventures: CollectionConfig = {
  slug: "adventures",
  hooks: revalidateHooks,
  admin: {
    group: "Contenu",
    useAsTitle: "title",
    defaultColumns: ["title", "commune", "region", "difficulty", "prix", "actif"],
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
      name: "actif",
      type: "checkbox",
      defaultValue: true,
      label: "Visible sur le site",
      admin: { position: "sidebar" },
    },
    {
      name: "ordre",
      type: "number",
      required: true,
      defaultValue: 100,
      label: "Ordre d'affichage",
      admin: { position: "sidebar" },
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
              type: "row",
              fields: [
                {
                  name: "region",
                  type: "relationship",
                  relationTo: "regions",
                  required: true,
                  label: "Région",
                },
                {
                  name: "partner",
                  type: "relationship",
                  relationTo: "partners",
                  label: "Partenaire référent",
                  admin: { description: "Proposé par défaut à la création d'un créneau." },
                },
              ],
            },
            {
              name: "spotId",
              type: "select",
              required: true,
              label: "Point de départ sur la carte",
              admin: {
                description: "Correspond à une clé de SPOT_XY dans src/lib/france-map.ts.",
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
            {
              name: "rendezVous",
              type: "group",
              label: "Point de rendez-vous",
              fields: [
                { name: "lieu", type: "text", label: "Lieu", admin: { description: "Ex. Parking de la base nautique." } },
                { name: "adresse", type: "text", label: "Adresse" },
                {
                  type: "row",
                  fields: [
                    { name: "lat", type: "number", label: "Latitude", admin: { width: "33%" } },
                    { name: "lng", type: "number", label: "Longitude", admin: { width: "33%" } },
                    { name: "heure", type: "text", label: "Heure d'accueil", admin: { width: "33%" } },
                  ],
                },
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
            // Un pack aventure associe toujours les deux disciplines : aucune
            // des deux distances ne peut être nulle.
            {
              type: "row",
              fields: [
                {
                  name: "randoKm",
                  type: "number",
                  required: true,
                  min: 0.1,
                  label: "Dont randonnée (km)",
                  admin: { description: "Obligatoire : tout parcours comporte une partie à pied." },
                },
                {
                  name: "canoeKm",
                  type: "number",
                  required: true,
                  min: 0.1,
                  label: "Dont canoë (km)",
                  admin: { description: "Obligatoire : tout parcours comporte une partie sur l'eau." },
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "tempsRandoH", type: "number", label: "Temps de randonnée (h)" },
                { name: "tempsCanoeH", type: "number", label: "Temps de canoë (h)" },
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
              type: "row",
              fields: [
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
                { name: "ageMin", type: "number", defaultValue: 8, label: "Âge minimum" },
              ],
            },
            {
              name: "niveauConseille",
              type: "textarea",
              label: "Niveau conseillé",
              admin: { description: "Ex. Marcheur régulier, à l'aise dans l'eau. Aucune expérience de canoë requise." },
            },
            {
              type: "row",
              fields: [
                { name: "saison", type: "text", required: true, label: "Saison" },
                { name: "groupe", type: "text", required: true, label: "Taille du groupe" },
              ],
            },
          ],
        },
        {
          label: "Tarifs",
          fields: [
            {
              type: "row",
              fields: [
                { name: "prix", type: "number", required: true, label: "Prix adulte (€ / pers.)" },
                { name: "prixEnfant", type: "number", label: "Prix enfant (€ / pers.)" },
                { name: "ageEnfantMax", type: "number", defaultValue: 12, label: "Tarif enfant jusqu'à (ans inclus)" },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "placesParDefaut",
                  type: "number",
                  defaultValue: 12,
                  label: "Places par créneau (défaut)",
                },
                {
                  name: "minParticipants",
                  type: "number",
                  defaultValue: 1,
                  label: "Participants minimum par réservation",
                },
                {
                  name: "maxParticipants",
                  type: "number",
                  defaultValue: 8,
                  label: "Participants maximum par réservation",
                },
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
          ],
        },
        {
          label: "Pratique",
          fields: [
            labelList("inclus", "Ce qui est compris"),
            labelList("nonInclus", "Ce qui n'est pas compris"),
            labelList("equipement", "Équipement conseillé", "Ce que le participant doit apporter."),
            {
              name: "pratique",
              type: "array",
              label: "Informations pratiques",
              labels: { singular: "Information", plural: "Informations" },
              admin: { description: "Parking, repas, météo, navette…" },
              fields: [
                { name: "label", type: "text", required: true, label: "Intitulé" },
                { name: "detail", type: "textarea", required: true, label: "Détail" },
              ],
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
            {
              name: "gpx",
              type: "upload",
              relationTo: "media",
              label: "Trace GPX",
              admin: { description: "Envoyée au client après réservation." },
            },
          ],
        },
        {
          label: "Liés",
          fields: [
            { name: "slots", type: "join", collection: "slots", on: "adventure", label: "Créneaux" },
            { name: "faqs", type: "join", collection: "faqs", on: "adventures", label: "Questions fréquentes" },
            { name: "reviews", type: "join", collection: "reviews", on: "adventure", label: "Avis" },
          ],
        },
      ],
    },
  ],
}
