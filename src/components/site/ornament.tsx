import { cn } from "@/lib/utils"

/**
 * Filet à losange, l'ornement de séparation des pages de titre anciennes.
 * Dessiné en SVG plutôt qu'avec un caractère de fleuron : les glyphes
 * ornementaux ne sont pas garantis d'une police à l'autre.
 */
export function OrnamentRule({
  className,
  weight = "single",
}: {
  className?: string
  /** `triple` pour la séparation principale, `single` pour les autres. */
  weight?: "single" | "triple"
}) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <span className="h-px flex-1 bg-border" />
      <svg
        viewBox={weight === "triple" ? "0 0 52 12" : "0 0 24 12"}
        className={cn("h-4 shrink-0 text-foreground", weight === "triple" ? "w-[4.35rem]" : "w-8")}
        fill="none"
        stroke="currentColor"
      >
        {weight === "triple" && (
          <>
            <path d="M8 3 L11 6 L8 9 L5 6 Z" strokeWidth="1.1" />
            <path d="M44 3 L47 6 L44 9 L41 6 Z" strokeWidth="1.1" />
          </>
        )}
        <path
          d={weight === "triple" ? "M26 1.5 L30.5 6 L26 10.5 L21.5 6 Z" : "M12 1.5 L16.5 6 L12 10.5 L7.5 6 Z"}
          strokeWidth="1.1"
        />
        <circle
          cx={weight === "triple" ? 26 : 12}
          cy="6"
          r="1.45"
          fill="currentColor"
          stroke="none"
        />
      </svg>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
