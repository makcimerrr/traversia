import type { CollectionConfig } from "payload"

import { adminOnly } from "../lib/access"

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email", group: "Administration" },
  labels: { singular: "Utilisateur", plural: "Utilisateurs" },
  access: {
    read: adminOnly,
  },
  fields: [
    { name: "nom", type: "text", label: "Nom" },
  ],
}
