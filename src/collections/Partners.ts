import type { CollectionConfig } from "payload"

import { revalidateHooks } from "../lib/revalidate"

/**
 * Un partenaire canoë : la base nautique qui fournit le matériel et
 * opère les créneaux sur le terrain.
 */
export const Partners: CollectionConfig = {
  slug: "partners",
  hooks: revalidateHooks,
  admin: {
    group: "Réseau",
    useAsTitle: "name",
    defaultColumns: ["name", "commune", "active"],
  },
  labels: { singular: "Partenaire", plural: "Partenaires" },
  access: { read: () => true },
  defaultSort: "name",
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, label: "Nom", admin: { width: "60%" } },
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
      name: "active",
      type: "checkbox",
      defaultValue: true,
      label: "Partenaire actif",
      admin: {
        position: "sidebar",
        description: "Décoché, le partenaire et ses créneaux disparaissent du site.",
      },
    },
    { name: "logo", type: "upload", relationTo: "media", label: "Logo", admin: { position: "sidebar" } },
    {
      type: "tabs",
      tabs: [
        {
          label: "Présentation",
          fields: [
            { name: "tagline", type: "text", label: "Accroche", admin: { description: "Une ligne." } },
            { name: "description", type: "textarea", label: "Présentation" },
            {
              name: "regions",
              type: "relationship",
              relationTo: "regions",
              hasMany: true,
              label: "Régions couvertes",
            },
          ],
        },
        {
          label: "Coordonnées",
          fields: [
            {
              type: "row",
              fields: [
                { name: "commune", type: "text", required: true, label: "Commune" },
                { name: "departement", type: "text", label: "Département" },
              ],
            },
            { name: "adresse", type: "text", label: "Adresse" },
            {
              type: "row",
              fields: [
                { name: "email", type: "email", label: "Courriel" },
                { name: "telephone", type: "text", label: "Téléphone" },
              ],
            },
            { name: "website", type: "text", label: "Site web" },
          ],
        },
        {
          label: "Interne",
          description: "Informations qui ne sont jamais publiées.",
          fields: [
            { name: "contactNom", type: "text", label: "Interlocuteur" },
            { name: "notes", type: "textarea", label: "Notes internes" },
          ],
        },
      ],
    },
    {
      name: "slots",
      type: "join",
      collection: "slots",
      on: "partner",
      label: "Créneaux opérés",
    },
  ],
}
