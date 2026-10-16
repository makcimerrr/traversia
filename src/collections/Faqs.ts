import type { CollectionConfig } from "payload"

import { revalidateHooks } from "../lib/revalidate"

export const FAQ_CATEGORIES = [
  { label: "Avant de réserver", value: "reservation" },
  { label: "Le jour J", value: "jour-j" },
  { label: "Matériel & équipement", value: "materiel" },
  { label: "Niveau & sécurité", value: "securite" },
  { label: "Annulation & remboursement", value: "annulation" },
] as const

/**
 * Questions fréquentes. Sans aventure associée, la question apparaît sur
 * la page FAQ générale ; associée à une ou plusieurs aventures, elle
 * apparaît aussi sur leurs fiches.
 */
export const Faqs: CollectionConfig = {
  slug: "faqs",
  hooks: revalidateHooks,
  admin: {
    group: "Contenu",
    useAsTitle: "question",
    defaultColumns: ["question", "categorie", "publie"],
  },
  labels: { singular: "Question fréquente", plural: "Questions fréquentes" },
  access: { read: () => true },
  defaultSort: "ordre",
  fields: [
    { name: "question", type: "text", required: true, label: "Question" },
    { name: "reponse", type: "textarea", required: true, label: "Réponse" },
    {
      type: "row",
      fields: [
        {
          name: "categorie",
          type: "select",
          required: true,
          defaultValue: "reservation",
          options: [...FAQ_CATEGORIES],
          label: "Catégorie",
        },
        { name: "ordre", type: "number", defaultValue: 100, label: "Ordre" },
        { name: "publie", type: "checkbox", defaultValue: true, label: "Publiée" },
      ],
    },
    {
      name: "general",
      type: "checkbox",
      defaultValue: true,
      label: "Afficher sur la page FAQ générale",
    },
    {
      name: "adventures",
      type: "relationship",
      relationTo: "adventures",
      hasMany: true,
      label: "Aventures concernées",
      admin: { description: "La question s'affiche aussi sur les fiches sélectionnées." },
    },
  ],
}
