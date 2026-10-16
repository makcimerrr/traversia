import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ButtonLink } from "@/components/site/button-link"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { formatDateLong, formatPrice } from "@/lib/format"
import { reconcileGiftCardSession } from "@/lib/gift-cards"
import { siteUrl } from "@/lib/site-url"

export const metadata: Metadata = { title: "Carte cadeau", robots: { index: false } }

export default async function GiftConfirmationPage({ searchParams }: PageProps<"/cartes-cadeaux/confirmation">) {
  const { session_id: sessionId } = await searchParams
  if (typeof sessionId !== "string") notFound()
  const card = await reconcileGiftCardSession(sessionId, await siteUrl())
  if (!card) notFound()
  const paid = card.statut !== "en_attente" && card.statut !== "annulee"

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Carte cadeau</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          {paid ? `Merci, ${card.acheteurNom}.` : "Paiement en attente."}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          {paid
            ? `Le code a été envoyé à ${card.acheteurEmail}${card.beneficiaireEmail ? ` et à ${card.beneficiaireEmail}` : ""}.`
            : "Si vous venez de payer, rechargez cette page dans quelques instants."}
        </p>
      </Container>
      {paid && (
        <Section>
          <Container className="py-14 sm:py-20">
            <div className="max-w-md border border-border">
              <div className="border-b border-border px-5 py-3">
                <p className="label text-muted-foreground">Carte cadeau Traversia</p>
              </div>
              <div className="px-5 py-8 text-center">
                <p className="font-mono text-2xl tracking-[0.15em]">{card.code}</p>
                <p className="mt-4 font-display text-3xl">{formatPrice(card.montantInitial)}</p>
                {card.expireLe && <p className="mt-3 label-sm text-muted-foreground">Valable jusqu&apos;au {formatDateLong(card.expireLe)}</p>}
              </div>
              <div className="border-t border-border px-5 py-4">
                <ButtonLink href="/aventures" variant="ghost" size="sm">
                  Choisir un parcours
                </ButtonLink>
              </div>
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
