import type { CollectionConfig } from "payload"

import { revalidateHooks } from "../lib/revalidate"

/**
 * Pages éditoriales libres : mentions légales, confidentialité, CGV, et
 * toute page qu'on souhaite ajouter sans développement. Servies sur /[slug].
 */
export const Pages: CollectionConfig = {
  slug: "pages",
  hooks: revalidateHooks,
  admin: {
    group: "Contenu",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "publie", "updatedAt"],
  },
  labels: { singular: "Page", plural: "Pages" },
  access: { read: () => true },
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
          admin: { width: "40%", description: "La page est servie sur /identifiant." },
        },
      ],
    },
    {
      name: "publie",
      type: "checkbox",
      defaultValue: true,
      label: "Publiée",
      admin: { position: "sidebar" },
    },
    {
      name: "description",
      type: "textarea",
      label: "Meta description",
      admin: { description: "Pour les moteurs de recherche. 150 caractères environ." },
    },
    { name: "content", type: "richText", required: true, label: "Contenu" },
  ],
}
