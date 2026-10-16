"use server"

import { getPayloadClient, usePayload } from "@/lib/payload"

export type NewsletterState = { status: "idle" | "done" | "error"; message?: string }

/** Inscription à la lettre d'information : courriel unique, consentement daté. */
export async function subscribeNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  if (formData.get("site")) return { status: "done", message: "Merci." }
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const prenom = String(formData.get("prenom") ?? "").trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: "error", message: "Adresse e-mail invalide." }
  if (!usePayload) return { status: "done", message: "Merci, c'est noté." }
  try {
    const payload = await getPayloadClient()
    const existing = await payload.find({ collection: "subscribers", where: { email: { equals: email } }, limit: 1, depth: 0 })
    if (existing.docs[0]) {
      if (!existing.docs[0].actif) {
        await payload.update({ collection: "subscribers", id: existing.docs[0].id, data: { actif: true, consentementLe: new Date().toISOString() } })
      }
    } else {
      await payload.create({
        collection: "subscribers",
        data: { email, prenom: prenom || undefined, source: "site", actif: true, consentementLe: new Date().toISOString() },
      })
    }
    return { status: "done", message: "Merci, c'est noté. Nous écrivons peu, et seulement quand il y a du nouveau." }
  } catch (error) {
    console.error("[newsletter] Inscription impossible.", error)
    return { status: "error", message: "Nous n'avons pas pu enregistrer votre adresse. Réessayez plus tard." }
  }
}
