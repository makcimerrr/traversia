import type { Metadata } from "next"

import { Container, Eyebrow, Section } from "@/components/site/section"

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à Traversia — bureau de Clécy, Calvados.",
}

const COORDONNEES = [
  { label: "Courriel", value: "bonjour@traversia.fr" },
  { label: "Téléphone", value: "+33 2 31 00 00 00" },
  { label: "Adresse", value: "12 rue du Vey, 14570 Clécy" },
  { label: "Saison", value: "Avril → Octobre, 7j/7" },
]

const MOTIFS = [
  "Réserver une date",
  "Groupe ou entreprise",
  "Question sur un niveau",
  "Autre",
]

export default function ContactPage() {
  return (
    <>
      <Container className="py-14 sm:py-20">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-8 max-w-3xl text-[3rem] leading-[0.96] sm:text-6xl lg:text-7xl">
          Dites-nous où vous voulez aller
        </h1>
      </Container>

      <Section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <dl className="border-t border-border">
              {COORDONNEES.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-1 border-b border-border py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="label text-muted-foreground">{item.label}</dt>
                  <dd className="font-mono text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
              Nous répondons sous quarante-huit heures en saison, un peu plus
              longtemps l&apos;hiver — nous sommes souvent dehors à retracer.
            </p>
          </div>

          {/* Formulaire de présentation : pas encore relié à un back-office. */}
          <form className="border border-border">
            <div className="border-b border-border px-5 py-4">
              <p className="label text-muted-foreground">Formulaire</p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <fieldset>
                <legend className="label-sm text-muted-foreground">Motif</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {MOTIFS.map((motif) => (
                    <label
                      key={motif}
                      className="cursor-pointer border border-border px-3.5 py-2.5 label-sm transition-colors has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background hover:border-foreground"
                    >
                      <input
                        type="radio"
                        name="motif"
                        value={motif}
                        className="sr-only"
                        defaultChecked={motif === MOTIFS[0]}
                      />
                      {motif}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="nom" label="Nom" placeholder="Camille Rouault" />
                <Field id="email" label="Courriel" type="email" placeholder="vous@exemple.fr" />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="date" label="Date souhaitée" placeholder="12 juin 2027" />
                <Field id="personnes" label="Nombre de personnes" placeholder="6" />
              </div>

              <div>
                <label htmlFor="message" className="label-sm text-muted-foreground">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Parlez-nous de votre groupe, de votre niveau, de ce que vous cherchez."
                  className="mt-3 w-full border border-border bg-transparent px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-6">
              <p className="label-sm text-muted-foreground">
                Envoi désactivé — maquette
              </p>
              <button
                type="button"
                className="border border-foreground bg-foreground px-5 py-3 label text-background transition-colors hover:bg-background hover:text-foreground"
              >
                Envoyer
              </button>
            </div>
          </form>
        </Container>
      </Section>
    </>
  )
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="label-sm text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        className="mt-3 w-full border-b border-border bg-transparent py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground"
      />
    </div>
  )
}
