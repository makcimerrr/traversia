import type { CollectionConfig } from "payload"

import { adminOnly } from "../lib/access"

/** Inscrits à la lettre d'information. Création publique, lecture admin. */
export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  admin: {
    group: "Réservations",
    useAsTitle: "email",
    defaultColumns: ["email", "source", "actif", "createdAt"],
  },
  labels: { singular: "Abonné", plural: "Abonnés (lettre d'information)" },
  access: {
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  defaultSort: "-createdAt",
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true, label: "Courriel" },
    {
      type: "row",
      fields: [
        { name: "prenom", type: "text", label: "Prénom" },
        {
          name: "source",
          type: "select",
          defaultValue: "site",
          label: "Origine",
          options: [
            { label: "Formulaire du site", value: "site" },
            { label: "Réservation", value: "reservation" },
            { label: "Import", value: "import" },
          ],
        },
        { name: "actif", type: "checkbox", defaultValue: true, label: "Actif" },
      ],
    },
    { name: "consentementLe", type: "date", label: "Consentement donné le", admin: { readOnly: true } },
  ],
}
