import path from "path"
import { fileURLToPath } from "url"

import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { s3Storage } from "@payloadcms/storage-s3"
import { fr } from "@payloadcms/translations/languages/fr"
import { buildConfig } from "payload"
import sharp from "sharp"

import { Adventures } from "./collections/Adventures"
import { Media } from "./collections/Media"
import { Users } from "./collections/Users"

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Cloudflare R2 est compatible S3 : on branche l'adaptateur s3 sur
 * l'endpoint du compte. Sans les variables d'environnement, le plugin
 * reste inactif et les médias sont écrits sur le disque local.
 */
const r2Configured = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ENDPOINT,
)

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
    pool: { connectionString: process.env.DATABASE_URI || "" },
  }),
  sharp,
  plugins: r2Configured
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.R2_BUCKET!,
          config: {
            endpoint: process.env.R2_ENDPOINT!,
            region: "auto",
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID!,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
            // R2 exige le style « path » pour l'adressage des buckets.
            forcePathStyle: true,
          },
        }),
      ]
    : [],
})
