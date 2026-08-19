import type { CollectionConfig } from "payload"

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email", group: "Administration" },
  labels: { singular: "Utilisateur", plural: "Utilisateurs" },
  access: {
    read: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "nom", type: "text", label: "Nom" },
  ],
}
