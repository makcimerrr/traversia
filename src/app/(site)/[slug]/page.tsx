import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { RichText } from "@/components/site/rich-text"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getPage, getPages } from "@/lib/content"
import { formatDateLong } from "@/lib/format"

/**
 * Pages éditoriales gérées dans Payload (mentions légales, confidentialité,
 * CGV…). Les routes nommées du dossier (site) passent toujours avant.
 */

export async function generateStaticParams() {
  const pages = await getPages()
  return pages.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return { title: page.title, description: page.description || undefined }
}

export default async function EditorialPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Traversia</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          {page.title}
        </h1>
        <p className="mt-6 label-sm text-muted-foreground">
          Mise à jour le {formatDateLong(page.updatedAt)}
        </p>
      </Container>
      <Section>
        <Container className="py-14 sm:py-20">
          <RichText body={page.body} />
        </Container>
      </Section>
    </>
  )
}
