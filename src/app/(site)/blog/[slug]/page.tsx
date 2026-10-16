import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { JsonLd } from "@/components/site/json-ld"
import { RichText } from "@/components/site/rich-text"
import { Container, Eyebrow, Section } from "@/components/site/section"
import { getAdventures, getPost, getPosts } from "@/lib/content"
import { formatDateLong } from "@/lib/format"
import { siteUrlFromEnv } from "@/lib/site-url"
import { POST_TAG_LABELS } from "@/lib/types"

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", publishedTime: post.publishedAt, images: post.cover ? [{ url: post.cover.url, alt: post.cover.alt }] : undefined },
  }
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params
  const [post, adventures] = await Promise.all([getPost(slug), getAdventures()])
  if (!post) notFound()
  const related = adventures.filter((a) => post.adventureSlugs.includes(a.slug))
  const base = siteUrlFromEnv()

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          image: post.cover?.url,
          author: { "@type": "Organization", name: "Traversia" },
          publisher: { "@type": "Organization", name: "Traversia", url: base },
          mainEntityOfPage: `${base}/blog/${post.slug}`,
        }}
      />
      <Container className="py-10 sm:py-14">
        <Link href="/blog" className="group inline-flex items-center gap-2 label text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Toutes les actualités
        </Link>
        <Eyebrow className="mt-10">
          {formatDateLong(post.publishedAt)}
          {post.tags.length > 0 && ` — ${post.tags.map((t) => POST_TAG_LABELS[t] ?? t).join(", ")}`}
        </Eyebrow>
        <h1 className="mt-8 max-w-4xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">{post.title}</h1>
        <p className="mt-6 max-w-2xl font-display text-xl italic leading-snug text-muted-foreground sm:text-2xl">{post.excerpt}</p>
      </Container>
      {post.cover && (
        <Section>
          <div className="relative aspect-[21/9] w-full">
            <Image src={post.cover.url} alt={post.cover.alt} fill priority sizes="100vw" className="object-cover grayscale" />
          </div>
        </Section>
      )}
      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
          <RichText body={post.body} className="max-w-3xl text-base" />
          {related.length > 0 && (
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="label text-muted-foreground">Parcours évoqués</p>
              <ul className="mt-5 border-t border-border">
                {related.map((a) => (
                  <li key={a.slug} className="border-b border-border">
                    <Link href={`/aventures/${a.slug}`} className="group flex items-center justify-between gap-4 py-4">
                      <span>
                        <span className="block text-lg leading-tight">{a.title}</span>
                        <span className="mt-1 block label-sm text-muted-foreground">
                          {a.commune} — {a.niveau}
                        </span>
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </Container>
      </Section>
    </>
  )
}
