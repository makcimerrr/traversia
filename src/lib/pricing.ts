import type { Adventure, Slot } from "./types"

export type QuoteLine = { label: string; quantite: number; unitaire: number; total: number }

export type Quote = {
  adultes: number
  enfants: number
  prixAdulte: number
  prixEnfant?: number
  lignes: QuoteLine[]
  sousTotal: number
  remise: number
  remiseLibelle: string
  total: number
}

/**
 * Devis d'une réservation. Le prix adulte du créneau prime sur celui de
 * la fiche ; le tarif enfant est celui de la fiche, sinon le tarif adulte.
 * Les remises (codes promo, cartes cadeaux) s'ajoutent ici.
 */
export function quote(
  adventure: Pick<Adventure, "prix" | "prixEnfant">,
  slot: Pick<Slot, "prix">,
  adultes: number,
  enfants: number,
  remise: { montant: number; libelle: string } = { montant: 0, libelle: "" },
): Quote {
  const prixAdulte = slot.prix || adventure.prix
  const prixEnfant = adventure.prixEnfant ?? undefined
  const lignes: QuoteLine[] = []
  if (adultes > 0) {
    lignes.push({ label: "Adulte", quantite: adultes, unitaire: prixAdulte, total: adultes * prixAdulte })
  }
  if (enfants > 0) {
    const unitaire = prixEnfant ?? prixAdulte
    lignes.push({ label: "Enfant", quantite: enfants, unitaire, total: enfants * unitaire })
  }
  const sousTotal = lignes.reduce((sum, l) => sum + l.total, 0)
  const montantRemise = Math.min(sousTotal, Math.max(0, remise.montant))
  return {
    adultes,
    enfants,
    prixAdulte,
    prixEnfant,
    lignes,
    sousTotal,
    remise: montantRemise,
    remiseLibelle: montantRemise > 0 ? remise.libelle : "",
    total: Math.max(0, sousTotal - montantRemise),
  }
}
