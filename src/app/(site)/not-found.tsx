import type { Metadata } from "next"

import { ErrorPlate } from "@/components/site/error-plate"

export const metadata: Metadata = { title: "Page introuvable" }

/** Rendu quand notFound() est appelé dans une route du site. */
export default function NotFound() {
  return (
    <ErrorPlate
      code="404"
      title="Vous êtes sorti du sentier"
      actions={[
        { href: "/", label: "Revenir à l'accueil", primary: true },
        { href: "/aventures", label: "Voir la carte des parcours" },
      ]}
    >
      <p>
        Cette page n&apos;existe pas, ou n&apos;existe plus. Il arrive qu&apos;un
        parcours soit retiré du catalogue — une crue, un sentier fermé, une
        convention qui s&apos;arrête.
      </p>
      <p className="mt-4">
        Si vous cherchiez une aventure précise, la carte les montre toutes.
      </p>
    </ErrorPlate>
  )
}
