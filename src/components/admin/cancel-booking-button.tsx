"use client"

import { useDocumentInfo } from "@payloadcms/ui"
import { useState } from "react"

/**
 * Bouton « Annuler la réservation » dans l'édition d'une réservation.
 * Appelle l'endpoint POST /api/bookings/:id/annuler, qui rembourse via
 * Stripe si demandé, passe le statut, libère les places et prévient le client.
 */
export function CancelBookingButton() {
  const { id, initialData } = useDocumentInfo()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const statut = initialData?.statut as string | undefined
  if (!id || !statut || statut === "annulee" || statut === "remboursee") return null

  const paid = statut === "confirmee" && Boolean(initialData?.stripePaymentIntentId)

  const cancel = async (rembourser: boolean) => {
    const motif = window.prompt("Motif de l'annulation (transmis au client) :", "Conditions météo défavorables")
    if (motif === null) return
    if (!window.confirm(rembourser ? "Annuler ET rembourser intégralement via Stripe ?" : "Annuler sans remboursement ?")) return
    setBusy(true)
    setResult(null)
    try {
      const res = await fetch(`/api/bookings/${id}/annuler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rembourser, motif }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.message ?? `Erreur ${res.status}`)
      setResult(body.message ?? "Réservation annulée.")
      setTimeout(() => window.location.reload(), 1200)
    } catch (error) {
      setResult((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 16 }}>
      {paid && (
        <button type="button" className="btn btn--style-primary btn--size-small" disabled={busy} onClick={() => cancel(true)}>
          Annuler et rembourser
        </button>
      )}
      <button type="button" className="btn btn--style-secondary btn--size-small" disabled={busy} onClick={() => cancel(false)}>
        {paid ? "Annuler sans rembourser" : "Annuler la réservation"}
      </button>
      {result && <span style={{ fontSize: 13 }}>{result}</span>}
    </div>
  )
}
