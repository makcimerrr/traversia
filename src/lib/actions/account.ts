"use server"

import { redirect } from "next/navigation"

import { sendAccountLink } from "@/lib/customer-account"
import { clearSessionCookie, setSessionCookie } from "@/lib/customer-session"
import { getPayloadClient, usePayload } from "@/lib/payload"
import { siteUrl } from "@/lib/site-url"

export type AccountState = { status: "idle" | "done" | "error"; message?: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function loginAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  if (!EMAIL.test(email) || !password) return { status: "error", message: "Courriel ou mot de passe manquant." }
  if (!usePayload) return { status: "error", message: "Connexion indisponible en démonstration." }
  try {
    const payload = await getPayloadClient()
    const { token, exp } = await payload.login({ collection: "customers", data: { email, password } })
    if (!token) throw new Error("no token")
    await setSessionCookie(token, exp)
  } catch {
    return { status: "error", message: "Courriel ou mot de passe incorrect." }
  }
  redirect("/compte")
}

export async function logoutAction() {
  await clearSessionCookie()
  redirect("/compte")
}

export async function requestLinkAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!EMAIL.test(email)) return { status: "error", message: "Adresse e-mail invalide." }
  if (usePayload) {
    await sendAccountLink(email, await siteUrl()).catch((error) => console.error("[compte] Lien impossible.", error))
  }
  return { status: "done", message: "Si un compte existe pour cette adresse, un lien vient de partir. Pensez aux courriers indésirables." }
}

export async function activateAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const token = String(formData.get("token") ?? "")
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")
  if (!token) return { status: "error", message: "Lien invalide. Demandez-en un nouveau." }
  if (password.length < 10) return { status: "error", message: "Dix caractères minimum." }
  if (password !== confirm) return { status: "error", message: "Les deux mots de passe diffèrent." }
  if (!usePayload) return { status: "error", message: "Indisponible en démonstration." }
  try {
    const payload = await getPayloadClient()
    const result = await payload.resetPassword({ collection: "customers", data: { token, password }, overrideAccess: true })
    if (!result.token) throw new Error("no token")
    const user = result.user as { id: number; compteActiveLe?: string | null }
    if (!user.compteActiveLe) {
      await payload.update({ collection: "customers", id: user.id, data: { compteActiveLe: new Date().toISOString() }, overrideAccess: true })
    }
    await setSessionCookie(result.token)
  } catch {
    return { status: "error", message: "Ce lien a expiré ou a déjà servi. Demandez-en un nouveau depuis la page Mon compte." }
  }
  redirect("/compte")
}
