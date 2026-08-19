"use client"

import { useEffect } from "react"

import { ErrorPlate } from "@/components/site/error-plate"
import { fontVariables } from "@/lib/fonts"
import "./(site)/globals.css"

/**
 * Dernier filet : cette frontière remplace le layout racine, elle doit donc
 * rendre son propre <html> et réimporter styles et polices.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="fr" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <main className="flex flex-1 flex-col">
          <ErrorPlate
            code="500"
            title="Le site n'a pas pu se charger"
            primaryAction={
              <button
                type="button"
                onClick={() => retry()}
                className="border border-foreground bg-foreground px-6 py-4 label text-background transition-colors hover:bg-background hover:text-foreground"
              >
                Recharger
              </button>
            }
            footer={
              error.digest ? (
                <p className="mt-8 label-sm text-muted-foreground">
                  Référence — {error.digest}
                </p>
              ) : null
            }
          >
            <p>
              Une panne est survenue avant même que la page puisse s&apos;afficher.
              Rechargez : dans la plupart des cas, cela suffit.
            </p>
            <p className="mt-4">
              Sinon, écrivez-nous à{" "}
              <a href="mailto:bonjour@traversia.fr" className="link-underline text-foreground">
                bonjour@traversia.fr
              </a>
              .
            </p>
          </ErrorPlate>
        </main>
      </body>
    </html>
  )
}
