import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Contenu" },
  labels: { singular: "Média", plural: "Médias" },
  access: { read: () => true },
  upload: {
    // Le stockage réel est délégué à R2 (voir plugin storage-s3).
    mimeTypes: ["image/*", "application/pdf"],
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
      admin: { description: "Décrit l'image pour les lecteurs d'écran." },
    },
    { name: "credit", type: "text", label: "Crédit photo" },
  ],
}
