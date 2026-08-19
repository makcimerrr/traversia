import { withPayload } from "@payloadcms/next/withPayload"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    // Le site a deux layouts racines — (site) et (payload) — donc le 404 des
    // URL non reconnues doit être un document autonome.
    globalNotFound: true,
  },
  images: {
    // Les médias sont servis depuis le store Vercel Blob.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
