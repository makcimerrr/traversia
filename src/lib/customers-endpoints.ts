import type { Endpoint } from "payload"

/**
 * POST /api/customers/lien-connexion — { email }
 * Envoie un lien pour définir (ou redéfinir) son mot de passe. Réponse
 * identique que le compte existe ou non, pour ne rien révéler.
 */
export const accountLinkEndpoint: Endpoint = {
  path: "/lien-connexion",
  method: "post",
  handler: async (req) => {
    let email = ""
    try {
      const body = req.json ? await req.json() : {}
      email = String(body?.email ?? "").trim().toLowerCase()
    } catch {
      email = ""
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ message: "Adresse e-mail invalide." }, { status: 400 })
    }
    const { sendAccountLink } = await import("./customer-account")
    const { siteUrlFromEnv } = await import("./site-url")
    await sendAccountLink(email, siteUrlFromEnv()).catch((error) => {
      console.error("[compte] Envoi du lien impossible.", error)
    })
    return Response.json({ message: "Si un compte existe pour cette adresse, un lien vient de partir." })
  },
}

/**
 * POST /api/customers/me/appareil — { token, platform } : enregistre l'appareil
 * du client connecté. DELETE — { token } : le retire (déconnexion).
 */
export const registerDeviceEndpoint: Endpoint = {
  path: "/me/appareil",
  method: "post",
  handler: async (req) => {
    if (req.user?.collection !== "customers") return Response.json({ message: "Connexion requise." }, { status: 401 })
    let body: { token?: string; platform?: string } = {}
    try {
      body = req.json ? await req.json() : {}
    } catch {
      body = {}
    }
    const token = String(body.token ?? "").trim()
    if (!/^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/.test(token)) {
      return Response.json({ message: "Jeton invalide." }, { status: 400 })
    }
    const platform = body.platform === "ios" || body.platform === "android" ? body.platform : "other"
    const existing = await req.payload.find({ collection: "devices", where: { token: { equals: token } }, limit: 1, depth: 0, overrideAccess: true })
    if (existing.docs[0]) {
      await req.payload.update({ collection: "devices", id: existing.docs[0].id, data: { customer: req.user.id, platform, actif: true }, overrideAccess: true })
    } else {
      await req.payload.create({ collection: "devices", data: { customer: req.user.id, token, platform, actif: true }, overrideAccess: true })
    }
    return Response.json({ ok: true })
  },
}

export const unregisterDeviceEndpoint: Endpoint = {
  path: "/me/appareil",
  method: "delete",
  handler: async (req) => {
    if (req.user?.collection !== "customers") return Response.json({ message: "Connexion requise." }, { status: 401 })
    let body: { token?: string } = {}
    try {
      body = req.json ? await req.json() : {}
    } catch {
      body = {}
    }
    const token = String(body.token ?? "").trim()
    if (token) {
      await req.payload.delete({
        collection: "devices",
        where: { and: [{ token: { equals: token } }, { customer: { equals: req.user.id } }] },
        overrideAccess: true,
      })
    }
    return Response.json({ ok: true })
  },
}
