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
