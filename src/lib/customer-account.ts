import "server-only"

import type { Payload } from "payload"

import { getSettings } from "./content"
import { toDateKey } from "./demo"
import { accountLinkEmail, sendEmail } from "./email"
import { getPayloadClient } from "./payload"

/**
 * Comptes clients. Le compte est créé au premier paiement confirmé : le
 * client reçoit un lien pour définir son mot de passe, valable deux jours.
 * Le même lien se redemande depuis /compte à tout moment.
 */

export async function issueActivationUrl(payload: Payload, email: string, siteUrl: string): Promise<string | undefined> {
  const token = await payload.forgotPassword({
    collection: "customers",
    data: { email },
    disableEmail: true,
  })
  return token ? `${siteUrl}/compte/activer?token=${encodeURIComponent(token)}` : undefined
}

export async function sendAccountLink(email: string, siteUrl: string): Promise<void> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: "customers", where: { email: { equals: email } }, limit: 1, depth: 0 })
  const customer = docs[0]
  if (!customer) return
  const url = await issueActivationUrl(payload, email, siteUrl)
  if (!url) return
  const settings = await getSettings()
  const mail = accountLinkEmail(customer.prenom, url, Boolean(customer.compteActiveLe))
  await sendEmail({ to: email, replyTo: settings.email, ...mail })
}

/** Heure d'ouverture du tracé pour un créneau : rendez-vous moins le délai des paramètres. */
export function traceOpensAt(dateKey: string, heure: string, hoursBefore: number): Date {
  const match = /(\d{1,2})\s*[h:]\s*(\d{0,2})/i.exec(heure)
  const h = match ? Number.parseInt(match[1], 10) : 8
  const m = match && match[2] ? Number.parseInt(match[2], 10) : 0
  // Heure de Paris, quel que soit le fuseau du serveur : on lit le décalage
  // (GMT+01:00 ou GMT+02:00) ce jour-là et on le retranche à l'heure UTC.
  const noonUtc = new Date(`${dateKey}T12:00:00.000Z`)
  const offsetName =
    new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Paris", timeZoneName: "longOffset" })
      .formatToParts(noonUtc)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT+01:00"
  const sign = offsetName.includes("-") ? -1 : 1
  const [oh, om] = offsetName.replace(/^GMT[+-]?/, "").split(":").map((v) => Number.parseInt(v || "0", 10))
  const offsetMs = sign * ((oh || 0) * 60 + (om || 0)) * 60_000
  const rdv = new Date(Date.UTC(noonUtc.getUTCFullYear(), noonUtc.getUTCMonth(), noonUtc.getUTCDate(), h, m) - offsetMs)
  return new Date(rdv.getTime() - hoursBefore * 3_600_000)
}

export { toDateKey }
