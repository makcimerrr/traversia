import "server-only"

import { Resend } from "resend"

import { formatDateLong, formatPrice } from "./format"
import type { Booking, SiteSettings } from "./types"

/**
 * Envoi d'e-mails via Resend (clé RESEND_API_KEY injectée par le
 * Marketplace Vercel). Sans clé, le message est journalisé : le site
 * fonctionne, mais rien ne part.
 */

const FROM = process.env.EMAIL_FROM || "Traversia <onboarding@resend.dev>"

export const emailEnabled = Boolean(process.env.RESEND_API_KEY)

type Mail = { to: string | string[]; subject: string; html: string; text: string; replyTo?: string }

export async function sendEmail(mail: Mail): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email] (non envoyé, RESEND_API_KEY absente) → ${mail.to} : ${mail.subject}`)
    return false
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({ from: FROM, ...mail })
  if (error) {
    console.error("[email] Échec d'envoi", error)
    return false
  }
  return true
}

// ----------------------------------------------------------------------------
// Gabarits
// ----------------------------------------------------------------------------

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const list = (items: string[]) => items.map((i) => `<li>${escape(i)}</li>`).join("")

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:32px 16px;background:#f4f4f4;font-family:Georgia,serif;color:#111">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="600" style="max-width:600px;background:#fff;border:1px solid #ddd" cellspacing="0" cellpadding="0">
<tr><td style="padding:28px 32px;border-bottom:1px solid #ddd"><span style="font-size:22px;letter-spacing:0.02em">Traversia</span></td></tr>
<tr><td style="padding:32px"><h1 style="margin:0 0 20px;font-size:26px;font-weight:normal;line-height:1.15">${escape(title)}</h1>${body}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #ddd;font-family:monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666">Packs aventure randonnée &amp; canoë</td></tr>
</table></td></tr></table></body></html>`
}

const p = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.55">${html}</p>`
const h2 = (text: string) => `<h2 style="margin:28px 0 10px;font-size:18px;font-weight:normal">${escape(text)}</h2>`
const ul = (items: string[]) => `<ul style="margin:0 0 14px;padding-left:20px;font-size:14px;line-height:1.6">${list(items)}</ul>`
const row = (label: string, value: string) =>
  `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-family:monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666;width:140px">${escape(label)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px">${escape(value)}</td></tr>`

function recap(booking: Booking): { rows: [string, string][]; text: string } {
  const { adventure, slot } = booking
  const participants = [
    booking.nbAdultes > 0 ? `${booking.nbAdultes} adulte${booking.nbAdultes > 1 ? "s" : ""}` : "",
    booking.nbEnfants > 0 ? `${booking.nbEnfants} enfant${booking.nbEnfants > 1 ? "s" : ""}` : "",
  ]
    .filter(Boolean)
    .join(", ")
  const rows: [string, string][] = [
    ["Référence", booking.reference],
    ["Parcours", adventure.title],
    ["Date", formatDateLong(slot.date)],
    ["Rendez-vous", [slot.heure || adventure.rendezVous.heure, adventure.rendezVous.lieu].filter(Boolean).join(" — ")],
    ["Adresse", adventure.rendezVous.adresse],
    ["Participants", participants],
    ["Montant", formatPrice(booking.montantTotal)],
  ].filter(([, v]) => v) as [string, string][]
  return { rows, text: rows.map(([l, v]) => `${l} : ${v}`).join("\n") }
}

export function bookingConfirmationEmail(
  booking: Booking,
  settings: SiteSettings,
  siteUrl: string,
): { subject: string; html: string; text: string } {
  const { adventure } = booking
  const { rows, text } = recap(booking)
  const url = `${siteUrl}/reservation/${booking.reference}`
  const gpx = adventure.gpx ? `${adventure.gpx.url}` : ""

  const html = layout(
    `C'est réservé, ${booking.prenom}.`,
    p(`Votre place sur <strong>${escape(adventure.title)}</strong> est confirmée. Voici l'essentiel ; tout est aussi sur votre page de réservation.`) +
      `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 20px">${rows.map(([l, v]) => row(l, v)).join("")}</table>` +
      p(`<a href="${url}" style="color:#111">Votre réservation et vos documents</a>${gpx ? ` · <a href="${gpx}" style="color:#111">Trace GPX</a>` : ""}`) +
      h2("Horaires") +
      ul(adventure.programme.map((s) => `${s.time} — ${s.title}`)) +
      h2("À apporter") +
      ul(adventure.equipement) +
      (adventure.pratique.length ? h2("Informations pratiques") + ul(adventure.pratique.map((i) => `${i.label} : ${i.detail}`)) : "") +
      h2("Annulation") +
      p(`Annulation gratuite jusqu'à ${settings.delaiAnnulationJours} jours avant la date. En cas de météo défavorable, nous reportons ou remboursons intégralement.`) +
      p(`Une question ? Répondez à ce message ou écrivez à <a href="mailto:${settings.email}" style="color:#111">${settings.email}</a>.`),
  )

  const textBody = [
    `C'est réservé, ${booking.prenom}.`,
    "",
    text,
    "",
    `Votre réservation : ${url}`,
    gpx ? `Trace GPX : ${gpx}` : "",
    "",
    "Horaires",
    ...adventure.programme.map((s) => `- ${s.time} — ${s.title}`),
    "",
    "À apporter",
    ...adventure.equipement.map((e) => `- ${e}`),
    "",
    ...adventure.pratique.map((i) => `${i.label} : ${i.detail}`),
    "",
    `Annulation gratuite jusqu'à ${settings.delaiAnnulationJours} jours avant la date.`,
    `Contact : ${settings.email}`,
  ]
    .filter((l) => l !== undefined)
    .join("\n")

  return { subject: `Réservation confirmée — ${adventure.title}, ${formatDateLong(booking.slot.date)}`, html, text: textBody }
}

export function bookingRequestEmail(
  booking: Booking,
  settings: SiteSettings,
  siteUrl: string,
): { subject: string; html: string; text: string } {
  const { rows, text } = recap(booking)
  const url = `${siteUrl}/reservation/${booking.reference}`
  const html = layout(
    `Demande reçue, ${booking.prenom}.`,
    p(`Nous avons bien reçu votre demande pour <strong>${escape(booking.adventure.title)}</strong>. Nous revenons vers vous sous quarante-huit heures pour la confirmer et organiser le règlement.`) +
      `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 20px">${rows.map(([l, v]) => row(l, v)).join("")}</table>` +
      p(`<a href="${url}" style="color:#111">Suivre votre demande</a>`) +
      p(`Une question ? Écrivez à <a href="mailto:${settings.email}" style="color:#111">${settings.email}</a>.`),
  )
  return {
    subject: `Demande de réservation reçue — ${booking.adventure.title}`,
    html,
    text: `Demande reçue, ${booking.prenom}.\n\n${text}\n\nSuivre : ${url}\nContact : ${settings.email}`,
  }
}

export function adminBookingEmail(booking: Booking, siteUrl: string): { subject: string; html: string; text: string } {
  const { rows, text } = recap(booking)
  const extra: [string, string][] = [
    ["Client", `${booking.prenom} ${booking.nom}`],
    ["Courriel", booking.email],
    ["Téléphone", booking.telephone || "—"],
    ["Statut", booking.statut],
  ]
  const all = [...rows, ...extra]
  const html = layout(
    booking.statut === "confirmee" ? "Nouvelle réservation payée" : "Nouvelle demande de réservation",
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${all.map(([l, v]) => row(l, v)).join("")}</table>` +
      (booking.message ? h2("Message") + p(escape(booking.message)) : "") +
      p(`<a href="${siteUrl}/admin/collections/bookings?search=${booking.reference}" style="color:#111">Ouvrir dans l'administration</a>`),
  )
  return {
    subject: `${booking.statut === "confirmee" ? "Réservation" : "Demande"} ${booking.reference} — ${booking.adventure.title}`,
    html,
    text: `${text}\n${extra.map(([l, v]) => `${l} : ${v}`).join("\n")}\n${booking.message ?? ""}`,
  }
}
