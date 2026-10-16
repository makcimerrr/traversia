import "server-only"

import { cookies, headers } from "next/headers"

import { getPayloadClient, usePayload } from "./payload"
import type { Customer } from "@/payload-types"

/** Session client sur le site : le même jeton que l'API, posé en cookie. */

const COOKIE = "payload-token"

export async function getCustomer(): Promise<Customer | null> {
  if (!usePayload) return null
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    return user && user.collection === "customers" ? (user as Customer) : null
  } catch {
    return null
  }
}

export async function setSessionCookie(token: string, exp?: number) {
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: exp ? new Date(exp * 1000) : undefined,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(COOKIE)
}
