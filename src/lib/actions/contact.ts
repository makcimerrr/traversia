"use server"

import { MESSAGE_MOTIFS } from "@/lib/types"
import { getPayloadClient, usePayload } from "@/lib/payload"

export type ContactState = {
  status: "idle" | "success" | "error"
  message?: string
  errors?: Partial<Record<"nom" | "email" | "message", string>>
}

const MOTIFS = MESSAGE_MOTIFS.map((m) => m.value)

/**
 * Enregistre un message du formulaire de contact dans la collection
 * `messages`. Sans base configurée, le message est simplement journalisé.
 */
export async function sendContactMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Champ piège : rempli uniquement par les robots.
  if (formData.get("site")) return { status: "success" }

  const nom = String(formData.get("nom") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const telephone = String(formData.get("telephone") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()
  const motifRaw = String(formData.get("motif") ?? "autre")
  const motif = (MOTIFS as string[]).includes(motifRaw) ? motifRaw : "autre"
  const adventureSlug = String(formData.get("aventure") ?? "").trim()

  const errors: ContactState["errors"] = {}
  if (nom.length < 2) errors.nom = "Indiquez votre nom."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Adresse e-mail invalide."
  if (message.length < 10) errors.message = "Dites-nous en un peu plus (dix caractères minimum)."
  if (Object.keys(errors).length) return { status: "error", errors }

  if (!usePayload) {
    console.info("[contact] Message reçu (démo, non enregistré) :", { nom, email, motif })
    return { status: "success" }
  }

  try {
    const payload = await getPayloadClient()
    let adventure: number | undefined
    if (adventureSlug) {
      const found = await payload.find({
        collection: "adventures",
        where: { slug: { equals: adventureSlug } },
        limit: 1,
        depth: 0,
      })
      adventure = found.docs[0]?.id
    }
    await payload.create({
      collection: "messages",
      data: {
        nom,
        email,
        telephone: telephone || undefined,
        motif: motif as (typeof MOTIFS)[number],
        message,
        adventure,
      },
    })
    return { status: "success" }
  } catch (error) {
    console.error("[contact] Enregistrement impossible.", error)
    return {
      status: "error",
      message: "Nous n'avons pas pu enregistrer votre message. Écrivez-nous directement par e-mail.",
    }
  }
}
