import { RichText as LexicalRichText } from "@payloadcms/richtext-lexical/react"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"

import type { PageBody } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Rend le corps d'une page éditoriale : l'état Lexical de Payload, ou les
 * paragraphes de démonstration. Les styles sont dans globals.css (.prose).
 */
export function RichText({ body, className }: { body: PageBody; className?: string }) {
  if (body.kind === "lexical") {
    return (
      <div className={cn("prose", className)}>
        <LexicalRichText data={body.data as SerializedEditorState} />
      </div>
    )
  }
  return (
    <div className={cn("prose", className)}>
      {body.blocks.map((block, i) => (
        <section key={block.heading ?? i}>
          {block.heading && <h2>{block.heading}</h2>}
          {block.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </section>
      ))}
    </div>
  )
}
