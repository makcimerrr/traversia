import type { MetadataRoute } from "next"

import { siteUrlFromEnv } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  const base = siteUrlFromEnv()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/reservation/", "/aventures/*/reserver", "/cartes-cadeaux/confirmation", "/compte"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
