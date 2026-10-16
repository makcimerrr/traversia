import type { CollectionConfig } from "payload"

import { revalidateHooks } from "../lib/revalidate"

/**
 * Un code promotionnel : pourcentage ou montant fixe, borné dans le temps
 * et en nombre d'utilisations, éventuellement limité à certaines aventures.
 */
export const PromoCodes: CollectionConfig = {
  slug: "promo-codes",
  admin: {
    group: "Réservations",
    useAsTitle: "code",
    defaultColumns: ["code", "type", "valeur", "utilisations", "usageMax", "actif", "validJusquau"],
  },
  labels: { singular: "Code promotionnel", plural: "Codes promotionnels" },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    ...revalidateHooks,
    beforeValidate: [
      ({ data }) => {
        if (data?.code) data.code = String(data.code).trim().toUpperCase().replace(/\s+/g, "")
        return data
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "code",
          type: "text",
          required: true,
          unique: true,
          index: true,
          label: "Code",
          admin: { description: "Majuscules, sans espaces. Ex. PRINTEMPS10", width: "50%" },
        },
        {
          name: "actif",
          type: "checkbox",
          defaultValue: true,
          label: "Actif",
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          defaultValue: "pourcentage",
          label: "Type de remise",
          options: [
            { label: "Pourcentage", value: "pourcentage" },
            { label: "Montant fixe (€)", value: "montant" },
          ],
        },
        { name: "valeur", type: "number", required: true, min: 0, label: "Valeur" },
        { name: "minimumPanier", type: "number", min: 0, label: "Panier minimum (€)" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "validDepuis",
          type: "date",
          label: "Valable à partir du",
          admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" } },
        },
        {
          name: "validJusquau",
          type: "date",
          label: "Valable jusqu'au",
          admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" } },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "usageMax", type: "number", min: 1, label: "Utilisations maximum", admin: { description: "Vide : illimité." } },
        {
          name: "utilisations",
          type: "number",
          defaultValue: 0,
          label: "Utilisations",
          admin: { readOnly: true, description: "Comptées à la confirmation du paiement." },
        },
      ],
    },
    {
      name: "adventures",
      type: "relationship",
      relationTo: "adventures",
      hasMany: true,
      label: "Limité aux aventures",
      admin: { description: "Vide : valable sur tout le catalogue." },
    },
    { name: "description", type: "text", label: "Libellé affiché au client", admin: { description: "Ex. Offre de printemps −10 %" } },
    { name: "notes", type: "textarea", label: "Notes internes" },
  ],
}
