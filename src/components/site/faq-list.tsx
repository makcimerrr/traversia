import type { Faq } from "@/lib/types"
import { FAQ_CATEGORY_LABELS } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Questions-réponses dépliables, sans JavaScript : details/summary natifs. */
export function FaqList({
  faqs,
  grouped = false,
  className,
}: {
  faqs: Faq[]
  grouped?: boolean
  className?: string
}) {
  if (faqs.length === 0) return null

  if (!grouped) return <FaqItems faqs={faqs} className={className} />

  const categories = Object.keys(FAQ_CATEGORY_LABELS) as Faq["categorie"][]
  return (
    <div className={cn("space-y-14", className)}>
      {categories.map((categorie) => {
        const items = faqs.filter((f) => f.categorie === categorie)
        if (items.length === 0) return null
        return (
          <section key={categorie} id={categorie} className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <h2 className="text-3xl leading-tight lg:sticky lg:top-28 lg:self-start">
              {FAQ_CATEGORY_LABELS[categorie]}
            </h2>
            <FaqItems faqs={items} />
          </section>
        )
      })}
    </div>
  )
}

function FaqItems({ faqs, className }: { faqs: Faq[]; className?: string }) {
  return (
    <div className={cn("border-t border-border", className)}>
      {faqs.map((faq) => (
        <details key={faq.id} className="group border-b border-border">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <span className="text-lg leading-snug">{faq.question}</span>
            <span
              aria-hidden
              className="mt-1 shrink-0 font-mono text-sm text-muted-foreground transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted-foreground">
            {faq.reponse}
          </p>
        </details>
      ))}
    </div>
  )
}
