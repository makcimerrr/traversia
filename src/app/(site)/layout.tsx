import type { Metadata } from "next"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { fontVariables } from "@/lib/fonts"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://traversia.fr"),
  title: {
    default: "Traversia — Packs aventure randonnée & canoë en Normandie",
    template: "%s — Traversia",
  },
  description:
    "Des itinéraires d'une ou deux journées qui associent randonnée et canoë, conçus et encadrés en Normandie.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Traversia",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="grain flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
