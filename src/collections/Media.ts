import type { CollectionConfig } from "payload"

import { revalidateHooks } from "../lib/revalidate"

export const Media: CollectionConfig = {
  slug: "media",
  hooks: revalidateHooks,
  admin: { group: "Contenu" },
  labels: { singular: "Média", plural: "Médias" },
  access: { read: () => true },
  upload: {
    // Le stockage réel est délégué à Vercel Blob (voir payload.config.ts).
    // Les traces GPX arrivent avec des types MIME variables selon le navigateur.
    mimeTypes: [
      "image/*",
      "application/pdf",
      "application/gpx+xml",
      "application/xml",
      "text/xml",
      "application/octet-stream",
    ],
    imageSizes: [
      { name: "card", width: 800, height: 600, position: "centre" },
      { name: "hero", width: 1920, height: 1080, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Texte alternatif",
      admin: { description: "Décrit l'image pour les lecteurs d'écran. Pour un fichier, son intitulé." },
    },
    { name: "credit", type: "text", label: "Crédit photo" },
  ],
}
