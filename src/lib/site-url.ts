import "server-only"

import { headers } from "next/headers"

/** URL publique du site, pour les liens absolus (Stripe, e-mails). */
export function siteUrlFromEnv(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

/** Même chose, mais à partir de la requête en cours quand il y en a une. */
export async function siteUrl(): Promise<string> {
  try {
    const h = await headers()
    const host = h.get("x-forwarded-host") ?? h.get("host")
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
      return `${proto}://${host}`
    }
  } catch {
    // Pas de requête (webhook hors contexte, script) : on retombe sur l'environnement.
  }
  return siteUrlFromEnv()
}
