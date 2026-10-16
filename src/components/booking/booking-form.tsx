"use client"

import Link from "next/link"
import { useActionState, useMemo, useState, useTransition } from "react"
import { Minus, Plus } from "lucide-react"

import { previewCode, submitBooking, type BookingFormState, type CodePreview } from "@/lib/actions/booking"
import { formatDateLong, formatPrice } from "@/lib/format"
import { quote } from "@/lib/pricing"
import type { Adventure, Slot } from "@/lib/types"
import { cn } from "@/lib/utils"

const INITIAL: BookingFormState = { status: "idle" }

const FIELD =
  "mt-2 w-full border border-border bg-transparent px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"

function Stepper({
  name,
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  name: string
  label: string
  hint: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4">
      <div>
        <p className="text-sm">{label}</p>
        <p className="mt-1 label-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Moins — ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex size-9 items-center justify-center border border-border transition-colors hover:border-foreground disabled:opacity-30"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-6 text-center font-mono text-sm tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`Plus — ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="flex size-9 items-center justify-center border border-border transition-colors hover:border-foreground disabled:opacity-30"
        >
          <Plus className="size-3.5" />
        </button>
        <input type="hidden" name={name} value={value} />
      </div>
    </div>
  )
}

export function BookingForm({
  adventure,
  slots,
  initialSlotId,
  paymentEnabled,
  cancelled,
}: {
  adventure: Adventure
  slots: Slot[]
  initialSlotId?: string
  paymentEnabled: boolean
  cancelled?: boolean
}) {
  const [state, action, pending] = useActionState(submitBooking, INITIAL)
  const v = state.values ?? {}

  const [slotId, setSlotId] = useState(v.slotId || initialSlotId || slots[0]?.id || "")
  const [adultes, setAdultes] = useState(Number(v.adultes ?? 2))
  const [enfants, setEnfants] = useState(Number(v.enfants ?? 0))

  const slot = slots.find((s) => s.id === slotId)
  const remaining = slot?.placesRestantes ?? 0
  const maxTotal = Math.min(adventure.maxParticipants, remaining || adventure.maxParticipants)
  // La remise dépend du créneau et du nombre de participants : l'aperçu est
  // daté de ces valeurs et recalculé quand elles changent.
  const [code, setCode] = useState(v.code ?? "")
  const [preview, setPreview] = useState<(CodePreview & { key: string }) | null>(null)
  const [checking, startCheck] = useTransition()
  const keyOf = (s: string, a: number, e: number) => `${s}|${a}|${e}`
  const runCheck = (s: string, a: number, e: number) => {
    if (!s || !code.trim()) {
      setPreview(null)
      return
    }
    startCheck(async () => setPreview({ ...(await previewCode(s, a, e, code)), key: keyOf(s, a, e) }))
  }
  const checkCode = () => runCheck(slotId, adultes, enfants)
  const changeSlot = (s: string) => {
    setSlotId(s)
    if (preview?.ok) runCheck(s, adultes, enfants)
  }
  const changeAdultes = (a: number) => {
    setAdultes(a)
    if (preview?.ok) runCheck(slotId, a, enfants)
  }
  const changeEnfants = (e: number) => {
    setEnfants(e)
    if (preview?.ok) runCheck(slotId, adultes, e)
  }
  const activePreview = preview && preview.key === keyOf(slotId, adultes, enfants) ? preview : null

  const q = useMemo(
    () =>
      slot
        ? quote(adventure, slot, adultes, enfants, activePreview?.ok ? { montant: activePreview.montant, libelle: activePreview.libelle } : undefined)
        : null,
    [adventure, slot, adultes, enfants, activePreview],
  )
  const childrenAllowed = adventure.ageMin <= adventure.ageEnfantMax

  const error = (field: string) =>
    state.status === "error" && state.field === field ? (
      <p className="mt-2 font-mono text-xs">{state.message}</p>
    ) : null

  return (
    <form action={action} noValidate className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
      <div className="space-y-12">
        {cancelled && (
          <p className="border border-border px-5 py-4 text-sm text-muted-foreground">
            Le paiement a été interrompu. Votre place n&apos;est pas réservée ; vous pouvez reprendre ci-dessous.
          </p>
        )}

        {/* ------------------------------ Date ------------------------------ */}
        <fieldset>
          <legend className="label text-muted-foreground">1 — La date</legend>
          {slots.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Aucune date n&apos;est ouverte pour l&apos;instant.{" "}
              <Link href={`/contact?aventure=${adventure.slug}`} className="link-underline text-foreground">
                Écrivez-nous
              </Link>{" "}
              pour être prévenu.
            </p>
          ) : (
            <ul className="mt-6 border-t border-border">
              {slots.map((s) => {
                const checked = s.id === slotId
                const last = s.placesRestantes <= 3
                return (
                  <li key={s.id} className="border-b border-border">
                    <label
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-4 px-4 py-4 transition-colors",
                        checked ? "bg-foreground text-background" : "hover:bg-muted/40",
                      )}
                    >
                      <span className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="slotId"
                          value={s.id}
                          checked={checked}
                          onChange={() => changeSlot(s.id)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "size-3 shrink-0 border",
                            checked ? "border-background bg-background" : "border-foreground",
                          )}
                        />
                        <span>
                          <span className="block text-sm capitalize">{formatDateLong(s.date)}</span>
                          <span className="mt-1 block label-sm opacity-70">
                            {s.heure && `${s.heure} — `}
                            {s.partnerName}
                          </span>
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-mono text-sm tabular-nums">{formatPrice(s.prix)}</span>
                        <span className={cn("mt-1 block label-sm", last ? "" : "opacity-70")}>
                          {s.placesRestantes} {last ? (s.placesRestantes > 1 ? "dernières places" : "dernière place") : "places"}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
          {error("slot")}
        </fieldset>

        {/* --------------------------- Participants -------------------------- */}
        <fieldset>
          <legend className="label text-muted-foreground">2 — Les participants</legend>
          <div className="mt-6 border-t border-border">
            <Stepper
              name="adultes"
              label="Adultes"
              hint={`${formatPrice(slot?.prix ?? adventure.prix)} par personne`}
              value={adultes}
              min={0}
              max={Math.max(0, maxTotal - enfants)}
              onChange={changeAdultes}
            />
            {childrenAllowed && (
              <Stepper
                name="enfants"
                label={`Enfants (${adventure.ageMin} à ${adventure.ageEnfantMax} ans)`}
                hint={adventure.prixEnfant ? `${formatPrice(adventure.prixEnfant)} par enfant` : "Même tarif que les adultes"}
                value={enfants}
                min={0}
                max={Math.max(0, maxTotal - adultes)}
                onChange={changeEnfants}
              />
            )}
            {!childrenAllowed && <input type="hidden" name="enfants" value={0} />}
          </div>
          <p className="mt-3 label-sm text-muted-foreground">
            {adventure.maxParticipants} participants maximum par réservation, {adventure.ageMin} ans minimum. Groupe plus large :{" "}
            <Link href={`/contact?aventure=${adventure.slug}&motif=groupe`} className="link-underline">
              écrivez-nous
            </Link>
            .
          </p>
          {error("participants")}
        </fieldset>

        {/* ---------------------------- Coordonnées --------------------------- */}
        <fieldset>
          <legend className="label text-muted-foreground">3 — Vos coordonnées</legend>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="label-sm text-muted-foreground">Prénom</span>
              <input name="prenom" defaultValue={v.prenom} autoComplete="given-name" required className={FIELD} />
              {error("prenom")}
            </label>
            <label className="block">
              <span className="label-sm text-muted-foreground">Nom</span>
              <input name="nom" defaultValue={v.nom} autoComplete="family-name" required className={FIELD} />
              {error("nom")}
            </label>
            <label className="block">
              <span className="label-sm text-muted-foreground">Courriel</span>
              <input name="email" type="email" defaultValue={v.email} autoComplete="email" required className={FIELD} />
              {error("email")}
            </label>
            <label className="block">
              <span className="label-sm text-muted-foreground">Téléphone</span>
              <input name="telephone" type="tel" defaultValue={v.telephone} autoComplete="tel" className={FIELD} />
              <span className="mt-2 block label-sm text-muted-foreground">Pour vous joindre la veille si la météo change.</span>
            </label>
          </div>
          <label className="mt-5 block">
            <span className="label-sm text-muted-foreground">Un message pour le guide (facultatif)</span>
            <textarea name="message" rows={3} defaultValue={v.message} className={cn(FIELD, "resize-y")} placeholder="Niveau du groupe, régime alimentaire, question…" />
          </label>
          <div className="hidden" aria-hidden>
            <label>
              Site web <input name="site" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        </fieldset>
      </div>

      {/* ------------------------------ Récapitulatif ----------------------------- */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-border">
          <div className="border-b border-border px-5 py-3">
            <p className="label text-muted-foreground">Récapitulatif</p>
          </div>
          <div className="px-5 py-5">
            <p className="font-display text-2xl leading-tight">{adventure.title}</p>
            <p className="mt-2 text-sm capitalize text-muted-foreground">
              {slot ? formatDateLong(slot.date) : "Choisissez une date"}
            </p>
            {slot && (
              <p className="mt-1 label-sm text-muted-foreground">
                {slot.heure || adventure.rendezVous.heure} — {adventure.rendezVous.lieu || adventure.commune}
              </p>
            )}
          </div>
          {q && q.lignes.length > 0 && (
            <dl className="border-t border-border px-5 py-4">
              {q.lignes.map((line) => (
                <div key={line.label} className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
                  <dt className="text-muted-foreground">
                    {line.quantite} × {line.label.toLowerCase()}{line.quantite > 1 ? "s" : ""}
                  </dt>
                  <dd className="font-mono tabular-nums">{formatPrice(line.total)}</dd>
                </div>
              ))}
              {q.remise > 0 && (
                <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
                  <dt className="text-muted-foreground">{q.remiseLibelle}</dt>
                  <dd className="font-mono tabular-nums">− {formatPrice(q.remise)}</dd>
                </div>
              )}
              <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-4">
                <dt className="label">Total</dt>
                <dd className="font-mono text-xl tabular-nums">{formatPrice(q.total)}</dd>
              </div>
            </dl>
          )}
          <div className="border-t border-border px-5 py-4">
            <label className="block">
              <span className="label-sm text-muted-foreground">Code promo ou carte cadeau</span>
              <span className="mt-2 flex gap-2">
                <input
                  name="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setPreview(null)
                  }}
                  onBlur={checkCode}
                  placeholder="PRINTEMPS10 ou CADEAU-…"
                  className="w-full border border-border bg-transparent px-3.5 py-2.5 font-mono text-sm uppercase outline-none transition-colors focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={checkCode}
                  disabled={checking || !code.trim() || !slot}
                  className="shrink-0 border border-border px-3.5 label-sm transition-colors hover:border-foreground disabled:opacity-40"
                >
                  {checking ? "…" : "Appliquer"}
                </button>
              </span>
            </label>
            {activePreview && (
              <p className={cn("mt-2 font-mono text-xs", activePreview.ok ? "text-muted-foreground" : "")}>
                {activePreview.ok ? `${activePreview.libelle} : − ${formatPrice(activePreview.montant)}` : activePreview.message}
              </p>
            )}
            {error("code")}
          </div>
          <div className="border-t border-border px-5 py-5">
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" name="cgv" className="mt-1 size-3.5 accent-current" />
              <span>
                J&apos;accepte les{" "}
                <Link href="/cgv" target="_blank" className="link-underline">
                  conditions de vente
                </Link>{" "}
                et j&apos;atteste que chaque participant sait nager 25 mètres.
              </span>
            </label>
            {error("cgv")}
            <label className="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" name="newsletter" className="mt-1 size-3.5 accent-current" />
              <span>Me prévenir des nouvelles dates et des nouveaux parcours.</span>
            </label>

            {state.status === "error" && !state.field && (
              <p className="mt-4 border border-foreground px-4 py-3 font-mono text-xs">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={pending || !slot || (adultes + enfants) < 1}
              className="mt-5 flex w-full items-center justify-center gap-3 border border-foreground bg-foreground px-6 py-4 label text-background transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              {pending
                ? "Un instant…"
                : q && q.total === 0 && q.remise > 0
                  ? "Confirmer avec la carte cadeau"
                  : paymentEnabled
                    ? `Payer ${q ? formatPrice(q.total) : ""}`
                    : "Envoyer la demande"}
            </button>
            <p className="mt-3 label-sm text-muted-foreground">
              {paymentEnabled
                ? "Paiement sécurisé par Stripe — carte, Apple Pay, Google Pay. Confirmation immédiate par e-mail."
                : "Le paiement en ligne arrive. Nous confirmons votre demande par e-mail sous 48 h."}
            </p>
          </div>
        </div>
      </aside>
    </form>
  )
}
