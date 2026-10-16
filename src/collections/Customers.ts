import type { CollectionConfig } from "payload"

/** Un client : identifié par son courriel, retrouvé à chaque réservation. */
export const Customers: CollectionConfig = {
  slug: "customers",
  admin: {
    group: "Réservations",
    useAsTitle: "email",
    defaultColumns: ["email", "nom", "prenom", "telephone", "updatedAt"],
    listSearchableFields: ["email", "nom", "prenom", "telephone"],
  },
  labels: { singular: "Client", plural: "Clients" },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: "-updatedAt",
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true, label: "Courriel" },
    {
      type: "row",
      fields: [
        { name: "prenom", type: "text", required: true, label: "Prénom" },
        { name: "nom", type: "text", required: true, label: "Nom" },
        { name: "telephone", type: "text", label: "Téléphone" },
      ],
    },
    {
      name: "stripeCustomerId",
      type: "text",
      label: "Identifiant client Stripe",
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "newsletter",
      type: "checkbox",
      defaultValue: false,
      label: "Inscrit à la lettre d'information",
      admin: { position: "sidebar" },
    },
    { name: "notes", type: "textarea", label: "Notes internes" },
    {
      name: "bookings",
      type: "join",
      collection: "bookings",
      on: "customer",
      label: "Réservations",
    },
  ],
}
