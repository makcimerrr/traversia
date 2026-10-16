import type { CollectionConfig } from "payload"

import { adminOnly, adminOrSelf, isAdmin } from "../lib/access"
import { accountLinkEndpoint } from "../lib/customers-endpoints"

/**
 * Un client : identifié par son courriel, retrouvé à chaque réservation.
 * Le compte (mot de passe) est créé au premier paiement confirmé ; il sert
 * au site (/compte) et à l'application mobile (API JSON).
 */
export const Customers: CollectionConfig = {
  slug: "customers",
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
    // Le lien d'activation envoyé après paiement reste valable deux jours.
    forgotPassword: { expiration: 48 * 60 * 60 * 1000 },
    cookies: { sameSite: "Lax", secure: process.env.NODE_ENV === "production" },
  },
  endpoints: [accountLinkEndpoint],
  admin: {
    group: "Réservations",
    useAsTitle: "email",
    defaultColumns: ["email", "nom", "prenom", "telephone", "updatedAt"],
    listSearchableFields: ["email", "nom", "prenom", "telephone"],
  },
  labels: { singular: "Client", plural: "Clients" },
  access: {
    read: adminOrSelf,
    create: adminOnly,
    update: adminOrSelf,
    delete: adminOnly,
    // Seul un administrateur déverrouille un compte bloqué.
    unlock: ({ req }) => isAdmin(req),
  },
  defaultSort: "-updatedAt",
  fields: [
    // Le champ `email` est fourni par l'authentification.
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
      access: { read: ({ req }) => isAdmin(req), update: ({ req }) => isAdmin(req) },
    },
    {
      name: "compteActiveLe",
      type: "date",
      label: "Compte activé le",
      admin: { readOnly: true, position: "sidebar", description: "Date à laquelle le client a défini son mot de passe." },
      access: { update: ({ req }) => isAdmin(req) },
    },
    {
      name: "newsletter",
      type: "checkbox",
      defaultValue: false,
      label: "Inscrit à la lettre d'information",
      admin: { position: "sidebar" },
    },
    { name: "notes", type: "textarea", label: "Notes internes", access: { read: ({ req }) => isAdmin(req), update: ({ req }) => isAdmin(req) } },
    {
      name: "bookings",
      type: "join",
      collection: "bookings",
      on: "customer",
      label: "Réservations",
    },
  ],
}
