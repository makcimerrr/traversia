import Link from "next/link"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const VARIANTS = {
  primary:
    "border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground",
  outline: "border border-foreground text-foreground hover:bg-foreground hover:text-background",
  ghost: "border border-border text-muted-foreground hover:border-foreground hover:text-foreground",
} as const

/** Le bouton du site : un cadre, une étiquette, pas d'arrondi. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: keyof typeof VARIANTS
  size?: "sm" | "md"
}) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center justify-center gap-3 label transition-colors",
        size === "md" ? "px-6 py-4" : "px-4 py-2.5",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
