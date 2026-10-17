import type { CollectionConfig } from "payload"

import { adminOnly, isAdmin, isCustomer } from "../lib/access"

/**
 * Appareils enregistrés pour les notifications push (jeton Expo). Un
 * client gère les siens via POST/DELETE /api/customers/me/appareil.
 */
export const Devices: CollectionConfig = {
  slug: "devices",
  admin: {
    group: "Réservations",
    useAsTitle: "token",
    defaultColumns: ["customer", "platform", "actif", "updatedAt"],
  },
  labels: { singular: "Appareil", plural: "Appareils (notifications)" },
  access: {
    read: ({ req }) => (isAdmin(req) ? true : isCustomer(req) && req.user ? { customer: { equals: req.user.id } } : false),
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "customers", required: true, index: true, label: "Client" },
    { name: "token", type: "text", required: true, unique: true, index: true, label: "Jeton Expo" },
    {
      name: "platform",
      type: "select",
      options: [
        { label: "iOS", value: "ios" },
        { label: "Android", value: "android" },
        { label: "Autre", value: "other" },
      ],
      label: "Plateforme",
    },
    { name: "actif", type: "checkbox", defaultValue: true, label: "Actif", admin: { description: "Désactivé quand Expo signale un appareil désinscrit." } },
  ],
}
