import type { Metadata } from "next"
import Link from "next/link"

import { ActivateForm } from "@/components/account/account-forms"
import { Container, Eyebrow, Section } from "@/components/site/section"

export const metadata: Metadata = { title: "Activer mon compte", robots: { index: false } }

export default async function ActiverPage({ searchParams }: PageProps<"/compte/activer">) {
  const { token } = await searchParams
  const t = typeof token === "string" ? token : ""

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Mon compte</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">Choisissez votre mot de passe</h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          Il vous servira sur le site et dans l&apos;application Traversia.
        </p>
      </Container>
      <Section>
        <Container className="py-14 sm:py-20">
          <div className="max-w-sm">
            {t ? (
              <ActivateForm token={t} />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ce lien est incomplet.{" "}
                <Link href="/compte" className="link-underline text-foreground">
                  Demandez-en un nouveau
                </Link>
                .
              </p>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}
