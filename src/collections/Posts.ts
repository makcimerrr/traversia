import type { CollectionConfig } from "payload"

import { revalidateHooks } from "../lib/revalidate"

/** Articles du journal : actualités, récits de parcours, conseils. */
export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    group: "Contenu",
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "publie"],
  },
  labels: { singular: "Article", plural: "Articles" },
  access: { read: () => true },
  defaultSort: "-publishedAt",
  hooks: revalidateHooks,
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
      name: "publie",
      type: "checkbox",
      defaultValue: false,
      label: "Publié",
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      label: "Date de publication",
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" } },
    },
    { name: "cover", type: "upload", relationTo: "media", label: "Image de couverture", admin: { position: "sidebar" } },
    {
      name: "tags",
      type: "select",
      hasMany: true,
      label: "Thèmes",
      options: [
        { label: "Actualités", value: "actualites" },
        { label: "Récits", value: "recits" },
        { label: "Conseils", value: "conseils" },
        { label: "Territoire", value: "territoire" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      label: "Chapô",
      admin: { description: "Deux phrases : affichées dans la liste et comme meta description." },
    },
    { name: "content", type: "richText", required: true, label: "Contenu" },
    {
      name: "adventures",
      type: "relationship",
      relationTo: "adventures",
      hasMany: true,
      label: "Parcours liés",
    },
  ],
}
