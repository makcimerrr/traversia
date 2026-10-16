import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload"

/**
 * Invalide le cache du site public après une modification dans l'admin.
 * Les pages sont prérendues et rafraîchies au plus tard toutes les cinq
 * minutes (voir `revalidate` dans src/app/(site)/layout.tsx) ; ce crochet
 * rend la publication immédiate.
 *
 * Hors du serveur Next (scripts `payload run`), `revalidatePath` n'est pas
 * disponible : l'appel est alors ignoré.
 */
async function revalidateSite(context: { context?: { skipRevalidate?: boolean } }) {
  if (context.context?.skipRevalidate) return
  try {
    const { revalidatePath } = await import("next/cache")
    revalidatePath("/", "layout")
  } catch {
    // Pas de contexte Next : rien à invalider.
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await revalidateSite(req)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateSite(req)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, req }) => {
  await revalidateSite(req)
  return doc
}

export const revalidateHooks = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
}
