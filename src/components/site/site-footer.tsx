import Link from "next/link"

import { getSettings } from "@/lib/content"

const COLUMNS = [
  {
    title: "Naviguer",
    links: [
      { href: "/aventures", label: "Les aventures" },
      { href: "/concept", label: "Le concept" },
      { href: "/a-propos", label: "À propos" },
      { href: "/partenaires", label: "Partenaires" },
      { href: "/faq", label: "Questions fréquentes" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Pratique",
    links: [
      { href: "/aventures", label: "Réserver une sortie" },
      { href: "/contact?motif=groupe", label: "Groupes & entreprises" },
      { href: "/cartes-cadeaux", label: "Cartes cadeaux" },
      { href: "/cgv", label: "Conditions de vente" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/mentions-legales", label: "Mentions légales" },
    ],
  },
]

export async function SiteFooter() {
  const settings = await getSettings()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(2,minmax(0,1fr))] lg:px-8">
        <div className="max-w-sm">
          <p className="font-display text-2xl">Traversia</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Packs aventure randonnée et canoë. Itinéraires conçus, balisés et
            encadrés par des guides diplômés, opérés avec des partenaires
            nautiques locaux.
          </p>
          <address className="mt-6 space-y-1 not-italic label-sm text-muted-foreground">
            {settings.adresse.split("\n").map((line) => (
              <p key={line}>{line}</p>
            ))}
            {settings.email && (
              <p>
                <a href={`mailto:${settings.email}`} className="link-underline">
                  {settings.email}
                </a>
              </p>
            )}
          </address>
          {(settings.instagram || settings.facebook) && (
            <p className="mt-5 flex gap-4 label-sm text-muted-foreground">
              {settings.instagram && (
                <a href={settings.instagram} rel="noopener noreferrer" target="_blank" className="link-underline">
                  Instagram
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} rel="noopener noreferrer" target="_blank" className="link-underline">
                  Facebook
                </a>
              )}
            </p>
          )}
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
          <p>
            © {new Date().getFullYear()} {settings.raisonSociale || "Traversia"} — Tous droits réservés
          </p>
          {settings.immatriculationTourisme && <p>Immatriculation {settings.immatriculationTourisme}</p>}
        </div>
      </div>
    </footer>
  )
}
