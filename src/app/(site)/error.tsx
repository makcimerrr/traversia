"use client"

import { useEffect } from "react"

import { ErrorPlate } from "@/components/site/error-plate"

/**
 * Frontière d'erreur du site. En Next 16, la fonction de reprise s'appelle
 * `retry` — l'ancien `reset` n'existe plus.
 */
export default function SiteError({
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
    <ErrorPlate
      code="500"
      title="Le terrain s'est dérobé"
      primaryAction={
        <button
          type="button"
          onClick={() => retry()}
          className="border border-foreground bg-foreground px-6 py-4 label text-background transition-colors hover:bg-background hover:text-foreground"
        >
          Réessayer
        </button>
      }
      actions={[{ href: "/aventures", label: "Voir la carte des parcours" }]}
      footer={
        error.digest ? (
          <p className="mt-8 label-sm text-muted-foreground">
            Référence — {error.digest}
          </p>
        ) : null
      }
    >
      <p>
        Une erreur inattendue est survenue de notre côté. Elle a été
        enregistrée. Le plus souvent, réessayer suffit.
      </p>
      <p className="mt-4">
        Si elle persiste, écrivez-nous à{" "}
        <a href="mailto:bonjour@traversia.fr" className="link-underline text-foreground">
          bonjour@traversia.fr
        </a>{" "}
        en nous donnant la référence ci-dessous.
      </p>
    </ErrorPlate>
  )
}
