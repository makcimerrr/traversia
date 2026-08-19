import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * Vignette décorative : un sentier en pointillé qui sort du cadre.
 * Même vocabulaire graphique que la carte des parcours.
 */
function OffTrail({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      className={cn("w-full", className)}
      aria-hidden
      focusable="false"
    >
      <defs>
        <pattern id="plate-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M20 0 L0 0 L0 20"
            fill="none"
            className="stroke-hairline"
            strokeWidth="1"
            opacity="0.5"
          />
        </pattern>
      </defs>

      <rect width="400" height="220" fill="url(#plate-grid)" />
      <rect
        x="0.5"
        y="0.5"
        width="399"
        height="219"
        fill="none"
        className="stroke-border"
        strokeWidth="1"
      />

      {/* Le sentier balisé, qui s'arrête net. */}
      <path
        d="M20 170 C70 150, 90 120, 130 118 S190 140, 224 108"
        fill="none"
        className="stroke-foreground"
        strokeWidth="1.5"
      />
      {/* Sa continuation perdue. */}
      <path
        d="M224 108 C260 78, 300 92, 336 62"
        fill="none"
        className="stroke-hairline"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />

      <circle r="15" cx="224" cy="108" className="fill-background stroke-foreground" strokeWidth="1.5" />
      <path
        d="M219 103 L229 113 M229 103 L219 113"
        className="stroke-foreground"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <circle r="4" cx="20" cy="170" className="fill-foreground" />
      <text
        x="20"
        y="192"
        className="fill-muted-foreground font-mono uppercase"
        fontSize="10"
        letterSpacing="2"
      >
        Départ
      </text>
    </svg>
  )
}

export type ErrorAction = { href: string; label: string; primary?: boolean }

/**
 * Mise en page commune aux quatre écrans d'erreur : 404 de route,
 * 404 global, erreur de segment et erreur globale.
 */
export function ErrorPlate({
  code,
  title,
  children,
  primaryAction,
  actions = [],
  footer,
}: {
  code: string
  title: string
  children: React.ReactNode
  /** Bouton d'action, placé avant les liens — une reprise, par exemple. */
  primaryAction?: React.ReactNode
  actions?: ErrorAction[]
  footer?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 items-center px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:items-center lg:gap-20">
        <div>
          <p className="flex items-center gap-3 label text-muted-foreground">
            <span aria-hidden className="h-px w-8 bg-foreground" />
            Erreur {code}
          </p>

          <h1 className="mt-8 text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <div className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground">
            {children}
          </div>

          {(primaryAction || actions.length > 0) && (
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {primaryAction}
              {actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "inline-flex items-center justify-center px-6 py-4 label transition-colors",
                    action.primary
                      ? "border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground"
                      : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                  )}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}

          {footer}
        </div>

        <OffTrail className="hidden lg:block" />
      </div>
    </div>
  )
}
