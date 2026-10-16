import type { CollectionConfig } from "payload"

import { revalidateHooks } from "../lib/revalidate"

/**
 * Une région d'implantation. Le `code` est le code INSEE de la région,
 * qui sert aussi d'identifiant de tracé dans src/lib/france-map.ts.
 */
export const Regions: CollectionConfig = {
  slug: "regions",
  hooks: revalidateHooks,
  admin: {
    group: "Réseau",
    useAsTitle: "name",
    defaultColumns: ["name", "code", "active"],
  },
  labels: { singular: "Région", plural: "Régions" },
  access: { read: () => true },
  defaultSort: "ordre",
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, label: "Nom", admin: { width: "50%" } },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          label: "Identifiant d'URL",
          admin: { width: "25%" },
        },
        {
          name: "code",
          type: "text",
          required: true,
          unique: true,
          label: "Code INSEE",
          admin: { width: "25%", description: "Ex. 28 pour la Normandie, 53 pour la Bretagne." },
        },
      ],
    },
    {
      name: "description",
      type: "textarea",
      label: "Présentation",
      admin: { description: "Deux ou trois phrases sur le territoire." },
    },
    {
      type: "row",
      fields: [
        {
          name: "active",
          type: "checkbox",
          defaultValue: true,
          label: "Ouverte à la réservation",
          admin: { description: "Décochée, la région apparaît comme « bientôt » sur la carte." },
        },
        { name: "ordre", type: "number", defaultValue: 100, label: "Ordre d'affichage" },
      ],
    },
    {
      name: "adventures",
      type: "join",
      collection: "adventures",
      on: "region",
      label: "Aventures dans cette région",
    },
  ],
}
