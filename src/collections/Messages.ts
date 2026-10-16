import type { CollectionConfig } from "payload"

import { adminOnly } from "../lib/access"

import { MESSAGE_MOTIFS } from "../lib/types"

/** Messages reçus par le formulaire de contact. Création publique, lecture admin. */
export const Messages: CollectionConfig = {
  slug: "messages",
  admin: {
    group: "Réservations",
    useAsTitle: "email",
    defaultColumns: ["email", "motif", "traite", "createdAt"],
  },
  labels: { singular: "Message", plural: "Messages" },
  access: {
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  defaultSort: "-createdAt",
  fields: [
    {
      type: "row",
      fields: [
        { name: "nom", type: "text", required: true, label: "Nom" },
        { name: "email", type: "email", required: true, label: "Courriel" },
        { name: "telephone", type: "text", label: "Téléphone" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "motif",
          type: "select",
          required: true,
          options: [...MESSAGE_MOTIFS],
          label: "Motif",
        },
        { name: "adventure", type: "relationship", relationTo: "adventures", label: "Aventure" },
      ],
    },
    { name: "message", type: "textarea", required: true, label: "Message" },
    {
      name: "traite",
      type: "checkbox",
      defaultValue: false,
      label: "Traité",
      admin: { position: "sidebar" },
    },
  ],
}
