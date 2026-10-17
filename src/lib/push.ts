import type { Payload } from "payload"

/**
 * Notifications push via l'API Expo. Les jetons viennent de la collection
 * Appareils ; un jeton signalé « DeviceNotRegistered » est désactivé.
 */

const EXPO_PUSH = "https://exp.host/--/api/v2/push/send"

export type PushMessage = { title: string; body: string; data?: Record<string, unknown> }

type Ticket = { status: "ok" | "error"; id?: string; message?: string; details?: { error?: string } }

export async function pushToCustomers(payload: Payload, customerIds: number[], message: PushMessage): Promise<number> {
  if (customerIds.length === 0) return 0
  const { docs } = await payload.find({
    collection: "devices",
    where: { and: [{ customer: { in: customerIds } }, { actif: { not_equals: false } }] },
    limit: 500,
    depth: 0,
    pagination: false,
  })
  if (docs.length === 0) return 0

  let sent = 0
  for (let i = 0; i < docs.length; i += 100) {
    const batch = docs.slice(i, i + 100)
    const messages = batch.map((d) => ({
      to: d.token,
      title: message.title,
      body: message.body,
      data: message.data ?? {},
      sound: "default",
      channelId: "default",
    }))
    try {
      const res = await fetch(EXPO_PUSH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(process.env.EXPO_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {}),
        },
        body: JSON.stringify(messages),
      })
      const body = (await res.json()) as { data?: Ticket[]; errors?: unknown[] }
      if (body.errors) {
        console.error("[push] Requête refusée", body.errors)
        continue
      }
      for (const [j, ticket] of (body.data ?? []).entries()) {
        if (ticket.status === "ok") sent++
        else if (ticket.details?.error === "DeviceNotRegistered") {
          await payload.update({ collection: "devices", id: batch[j].id, data: { actif: false } })
        } else console.warn("[push] Échec", ticket.message)
      }
    } catch (error) {
      console.error("[push] Envoi impossible", error)
    }
  }
  return sent
}
