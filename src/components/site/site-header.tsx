"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"

const NAV = [
  { href: "/aventures", label: "Les aventures" },
  { href: "/entreprise", label: "L'entreprise" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-baseline gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="font-display text-xl tracking-[0.02em]">Traversia</span>
          <span className="hidden label-sm text-muted-foreground sm:inline">
            Est. 2019
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "label transition-colors",
                pathname.startsWith(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/aventures"
            className="border border-foreground px-4 py-2.5 label transition-colors hover:bg-foreground hover:text-background"
          >
            Réserver
          </Link>
        </nav>

        <button
          type="button"
          className="-mr-2 p-2 md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border px-4 py-4 label text-muted-foreground sm:px-6"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
