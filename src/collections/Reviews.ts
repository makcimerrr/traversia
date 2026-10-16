import type { CollectionConfig } from "payload"

import { revalidateHooks } from "../lib/revalidate"

/** Avis clients, modérés : rien n'est publié sans la case « publié ». */
export const Reviews: CollectionConfig = {
  slug: "reviews",
  hooks: revalidateHooks,
  admin: {
    group: "Contenu",
    useAsTitle: "auteur",
    defaultColumns: ["auteur", "adventure", "note", "date", "publie"],
  },
  labels: { singular: "Avis client", plural: "Avis clients" },
  access: { read: () => true },
  defaultSort: "-date",
  fields: [
    {
      type: "row",
      fields: [
        { name: "auteur", type: "text", required: true, label: "Prénom (et initiale)" },
        {
          name: "note",
          type: "select",
          required: true,
          label: "Note",
          options: [
            { label: "5 — Excellent", value: "5" },
            { label: "4 — Très bien", value: "4" },
            { label: "3 — Bien", value: "3" },
            { label: "2 — Moyen", value: "2" },
            { label: "1 — Décevant", value: "1" },
          ],
        },
        {
          name: "date",
          type: "date",
          required: true,
          label: "Date de la sortie",
          admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" } },
        },
      ],
    },
    { name: "texte", type: "textarea", required: true, label: "Avis" },
    {
      type: "row",
      fields: [
        {
          name: "adventure",
          type: "relationship",
          relationTo: "adventures",
          label: "Aventure",
        },
        { name: "publie", type: "checkbox", defaultValue: false, label: "Publié sur le site" },
      ],
    },
    { name: "email", type: "email", label: "Courriel (non publié)" },
  ],
}
