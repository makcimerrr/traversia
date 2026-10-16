import type { CollectionConfig } from "payload"

import { revalidateAfterChange, revalidateAfterDelete } from "../lib/revalidate"

export const SLOT_STATUS = [
  { label: "Ouvert", value: "ouvert" },
  { label: "Complet", value: "complet" },
  { label: "Fermé (date désactivée)", value: "ferme" },
  { label: "Annulé", value: "annule" },
] as const

/**
 * Un créneau : une aventure, un jour, un partenaire, un nombre de places.
 * C'est l'unité réservable. Le stock se gère ici ; `placesReservees` est
 * tenu à jour par les réservations et ne s'édite pas à la main.
 */
export const Slots: CollectionConfig = {
  slug: "slots",
  admin: {
    group: "Réservations",
    useAsTitle: "titre",
    defaultColumns: ["titre", "date", "partner", "places", "placesReservees", "statut"],
    listSearchableFields: ["titre"],
    description:
      "Une ligne par date proposée. Pour fermer une date complète, passer son statut à « Fermé ».",
  },
  labels: { singular: "Créneau", plural: "Créneaux" },
  access: { read: () => true },
  defaultSort: "date",
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
    beforeChange: [
      async ({ data, req }) => {
        // Titre lisible dans les listes : « Suisse Normande — 12/06/2027 ».
        if (data?.adventure && data?.date) {
          const id = typeof data.adventure === "object" ? data.adventure.id : data.adventure
          const adventure = await req.payload.findByID({
            collection: "adventures",
            id,
            depth: 0,
          })
          const date = new Date(data.date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          data.titre = `${adventure.title} — ${date}`
        }
        // Un créneau plein passe automatiquement en « complet ».
        if (
          data &&
          typeof data.places === "number" &&
          typeof data.placesReservees === "number" &&
          data.statut === "ouvert" &&
          data.placesReservees >= data.places
        ) {
          data.statut = "complet"
        }
        return data
      },
    ],
  },
  fields: [
    { name: "titre", type: "text", admin: { hidden: true } },
    {
      type: "row",
      fields: [
        {
          name: "adventure",
          type: "relationship",
          relationTo: "adventures",
          required: true,
          label: "Aventure",
          admin: { width: "50%" },
        },
        {
          name: "partner",
          type: "relationship",
          relationTo: "partners",
          required: true,
          label: "Partenaire",
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "date",
          type: "date",
          required: true,
          index: true,
          label: "Date",
          admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" }, width: "33%" },
        },
        {
          name: "heure",
          type: "text",
          label: "Heure de rendez-vous",
          admin: { width: "33%", description: "Ex. 08h30. Vide : celle de la fiche." },
        },
        {
          name: "statut",
          type: "select",
          required: true,
          defaultValue: "ouvert",
          options: [...SLOT_STATUS],
          label: "Statut",
          admin: { width: "33%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "places", type: "number", required: true, min: 1, label: "Places", admin: { width: "33%" } },
        {
          name: "placesReservees",
          type: "number",
          defaultValue: 0,
          min: 0,
          label: "Places réservées",
          admin: { width: "33%", readOnly: true, description: "Calculé depuis les réservations." },
        },
        {
          name: "prix",
          type: "number",
          label: "Prix spécifique (€ / pers.)",
          admin: { width: "33%", description: "Vide : le prix de la fiche s'applique." },
        },
      ],
    },
    { name: "note", type: "textarea", label: "Note interne" },
  ],
}
