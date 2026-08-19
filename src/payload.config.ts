import path from "path"
import { fileURLToPath } from "url"

import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob"
import { fr } from "@payloadcms/translations/languages/fr"
import { buildConfig } from "payload"
import sharp from "sharp"

import { Adventures } from "./collections/Adventures"
import { Media } from "./collections/Media"
import { Users } from "./collections/Users"

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Les médias vont sur Vercel Blob. Sans jeton, le plugin reste inactif et
 * les fichiers sont écrits sur le disque local — utilisable en développement
 * seulement, le système de fichiers étant en lecture seule sur Vercel.
 */
const blobToken = process.env.BLOB_READ_WRITE_TOKEN

/**
 * L'intégration Neon injecte DATABASE_URL ; DATABASE_URI reste accepté
 * pour une base fournie à la main.
 */
const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL || ""

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — Traversia",
    },
  },
  i18n: { supportedLanguages: { fr } },
  collections: [Adventures, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: { connectionString },
  }),
  sharp,
  plugins: blobToken
    ? [
        vercelBlobStorage({
          collections: { media: true },
          token: blobToken,
        }),
      ]
    : [],
})
