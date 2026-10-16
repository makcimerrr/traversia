import type { MetadataRoute } from "next"

import { getAdventures, getPages, getPosts } from "@/lib/content"
import { siteUrlFromEnv } from "@/lib/site-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrlFromEnv()
  const [adventures, pages, posts] = await Promise.all([getAdventures(), getPages(), getPosts()])
  const now = new Date()

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/aventures`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...adventures.map((a) => ({
      url: `${base}/aventures/${a.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    { url: `${base}/concept`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/partenaires`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/cartes-cadeaux`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(`${p.publishedAt}T12:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    ...pages.map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: new Date(`${p.updatedAt}T12:00:00.000Z`),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ]
}
