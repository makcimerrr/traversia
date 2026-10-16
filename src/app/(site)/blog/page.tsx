import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Container, Eyebrow, Section } from "@/components/site/section"
import { getPosts } from "@/lib/content"
import { formatDateLong } from "@/lib/format"
import { POST_TAG_LABELS } from "@/lib/types"

export const metadata: Metadata = {
  title: "Actualités",
  description: "Nouvelles dates, récits de reconnaissance, conseils pour choisir et préparer un pack aventure randonnée & canoë.",
}

export default async function BlogPage() {
  const posts = await getPosts()
  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Actualités</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          Le journal des traversées
        </h1>
      </Container>
      <Section>
        <Container className="py-14 sm:py-20">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Rien à lire pour l&apos;instant.</p>
          ) : (
            <ol className="border-t border-border">
              {posts.map((post) => (
                <li key={post.slug} className="border-b border-border">
                  <Link href={`/blog/${post.slug}`} className="group grid gap-4 py-8 sm:grid-cols-[11rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-8">
                    <span className="label text-muted-foreground">
                      {formatDateLong(post.publishedAt)}
                      {post.tags.length > 0 && (
                        <span className="mt-2 block">{post.tags.map((t) => POST_TAG_LABELS[t] ?? t).join(", ")}</span>
                      )}
                    </span>
                    <span>
                      <span className="block text-2xl leading-tight sm:text-3xl">{post.title}</span>
                      <span className="mt-3 block max-w-2xl text-sm leading-relaxed text-muted-foreground">{post.excerpt}</span>
                    </span>
                    <ArrowRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block" />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </Section>
    </>
  )
}
