import Link from "next/link"

const COLUMNS = [
  {
    title: "Naviguer",
    links: [
      { href: "/aventures", label: "Les aventures" },
      { href: "/entreprise", label: "L'entreprise" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Pratique",
    links: [
      { href: "/contact", label: "Réserver une sortie" },
      { href: "/contact", label: "Groupes & entreprises" },
      { href: "/contact", label: "Cartes cadeaux" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(2,minmax(0,1fr))] lg:px-8">
        <div className="max-w-sm">
          <p className="font-display text-2xl">Traversia</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Packs aventure randonnée et canoë. Bureau à Clécy, Calvados.
            Itinéraires conçus, balisés et encadrés par des guides diplômés.
          </p>
          <p className="mt-6 label-sm text-muted-foreground">
            49.0872 N — 0.4778 W
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="label text-muted-foreground">{column.title}</p>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm link-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-5 label-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Traversia — Tous droits réservés</p>
          <p>Site de présentation</p>
        </div>
      </div>
    </footer>
  )
}
