import { withPayload } from "@payloadcms/next/withPayload"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Les médias sont servis depuis le domaine public du bucket R2.
    remotePatterns: process.env.R2_PUBLIC_URL
      ? [new URL(`${process.env.R2_PUBLIC_URL}/**`)]
      : [],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
