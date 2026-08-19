import type { Metadata } from "next"
import Link from "next/link"

import { ErrorPlate } from "@/components/site/error-plate"
import { fontVariables } from "@/lib/fonts"
import "./(site)/globals.css"

export const metadata: Metadata = {
  title: "Page introuvable — Traversia",
  description: "Cette adresse ne correspond à aucune page du site.",
}

/**
 * 404 des URL qui ne correspondent à aucune route. Le site a deux layouts
 * racines — (site) et (payload) — donc Next ne peut pas composer un 404
 * global à partir de l'un d'eux : ce fichier doit rendre son propre document.
 */
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={`${fontVariables} h-full antialiased`}>
      <body className="grain flex min-h-full flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-baseline gap-2.5">
              <span className="font-display text-xl tracking-[0.02em]">Traversia</span>
              <span className="hidden label-sm text-muted-foreground sm:inline">
                Est. 2019
              </span>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <ErrorPlate
            code="404"
            title="Cette adresse n'existe pas"
            actions={[
              { href: "/", label: "Revenir à l'accueil", primary: true },
              { href: "/aventures", label: "Voir la carte des parcours" },
            ]}
          >
            <p>
              L&apos;adresse demandée ne correspond à aucune page du site. Une
              faute de frappe, un lien ancien, ou une page que nous avons
              retirée.
            </p>
            <p className="mt-4">
              Les sept parcours sont tous accessibles depuis la carte.
            </p>
          </ErrorPlate>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-5 label-sm text-muted-foreground sm:px-6 lg:px-8">
            Traversia — Clécy, Calvados
          </div>
        </footer>
      </body>
    </html>
  )
}
