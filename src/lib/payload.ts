import "server-only"

import type { Payload } from "payload"

/**
 * Accès partagé à Payload côté serveur.
 *
 * Tant qu'aucune base n'est configurée, `usePayload` est faux et les
 * lecteurs de src/lib/content.ts servent le contenu de démonstration.
 */
export const usePayload = Boolean(
  (process.env.DATABASE_URI || process.env.DATABASE_URL) && process.env.PAYLOAD_SECRET,
)

export async function getPayloadClient(): Promise<Payload> {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("@payload-config"),
  ])
  return getPayload({ config })
}

/**
 * Exécute une lecture Payload, ou renvoie le contenu de démonstration si
 * la base n'est pas configurée ou injoignable. Un site vitrine ne doit pas
 * tomber parce que la base est indisponible.
 */
export async function readOrDemo<T>(
  label: string,
  read: (payload: Payload) => Promise<T>,
  demo: () => T,
): Promise<T> {
  if (!usePayload) return demo()
  try {
    return await read(await getPayloadClient())
  } catch (error) {
    console.warn(`[content] Payload indisponible pour ${label}, contenu de démo servi.`, error)
    return demo()
  }
}
