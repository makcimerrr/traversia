import type { Metadata } from "next"

import { Analytics, CookieBanner } from "@/components/site/consent"
import { JsonLd } from "@/components/site/json-ld"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { getSettings } from "@/lib/content"
import { fontVariables } from "@/lib/fonts"
import { siteUrlFromEnv } from "@/lib/site-url"
import "./globals.css"

/** Les pages sont prérendues et rafraîchies au plus tard toutes les cinq minutes. */
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  return {
    metadataBase: new URL(siteUrlFromEnv()),
    title: {
      default: "Traversia — Packs aventure randonnée & canoë en Normandie",
      template: "%s — Traversia",
    },
    description:
      "Des itinéraires d'une ou deux journées qui associent randonnée et canoë, conçus et encadrés en Normandie. Réservation en ligne.",
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: "Traversia",
    },
    verification: settings.googleSiteVerification ? { google: settings.googleSiteVerification } : undefined,
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings()
  const base = siteUrlFromEnv()
  const organization = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Traversia",
    url: base,
    email: settings.email,
    telephone: settings.telephone || undefined,
    address: settings.adresse
      ? { "@type": "PostalAddress", streetAddress: settings.adresse.split("\n")[0], addressLocality: "Clécy", postalCode: "14570", addressCountry: "FR" }
      : undefined,
    areaServed: "Normandie",
    sameAs: [settings.instagram, settings.facebook].filter(Boolean),
  }

  return (
    <html
      lang="fr"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="grain flex min-h-full flex-col">
        <JsonLd data={organization} />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CookieBanner enabled={Boolean(settings.gaId || settings.metaPixelId)} />
        <Analytics gaId={settings.gaId} metaPixelId={settings.metaPixelId} />
      </body>
    </html>
  )
}
