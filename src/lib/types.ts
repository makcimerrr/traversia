/** Niveau de difficulté, de 1 (accessible à tous) à 5 (engagé). */
export type Difficulty = 1 | 2 | 3 | 4 | 5

export type Discipline = "randonnee" | "canoe"

export type ProgrammeStep = {
  /** Repère horaire ou séquence, ex. "09h00" ou "Jour 2". */
  time: string
  title: string
  detail: string
}

export type PracticalInfo = { label: string; detail: string }

/** Une image ou un fichier servi depuis Payload (Vercel Blob) ou le disque. */
export type MediaRef = {
  url: string
  alt: string
  width?: number
  height?: number
  /** Variante recadrée 800×600, quand elle existe. */
  cardUrl?: string
}

export type RendezVous = {
  lieu: string
  adresse: string
  lat?: number
  lng?: number
  heure: string
}

export type Adventure = {
  slug: string
  /** Clé de position sur la carte — voir SPOT_XY dans france-map.ts. */
  spotId: string
  /** Code INSEE de la région, identifiant de tracé sur la carte. */
  regionCode: string
  regionSlug: string
  regionName: string
  /** Partenaire référent, quand il est renseigné. */
  partnerSlug?: string
  partnerName?: string
  title: string
  /** Accroche courte, une ligne, affichée sur la carte-fiche. */
  tagline: string
  commune: string
  departement: string
  /** Deux à quatre phrases : donner envie, pas tout dire. */
  intro: string
  difficulty: Difficulty
  /** Libellé du niveau, aligné sur la difficulté. */
  niveau: string
  /** Conseil en prose : à qui s'adresse le parcours. */
  niveauConseille: string
  ageMin: number
  stats: {
    distanceKm: number
    randoKm: number
    canoeKm: number
    deniveleM: number
    /** Durée totale sur le terrain, en heures. */
    dureeH: number
    /** Nombre de jours (1 = à la journée). */
    jours: number
    tempsRandoH: number
    tempsCanoeH: number
  }
  saison: string
  groupe: string
  prix: number
  prixEnfant?: number
  ageEnfantMax: number
  placesParDefaut: number
  minParticipants: number
  maxParticipants: number
  temps_forts: string[]
  programme: ProgrammeStep[]
  inclus: string[]
  nonInclus: string[]
  equipement: string[]
  pratique: PracticalInfo[]
  rendezVous: RendezVous
  cover?: MediaRef
  gallery: MediaRef[]
  gpx?: MediaRef
}

export type Region = {
  slug: string
  code: string
  name: string
  description: string
  active: boolean
}

export type Partner = {
  slug: string
  name: string
  tagline: string
  description: string
  commune: string
  departement: string
  adresse: string
  website?: string
  telephone?: string
  regionSlugs: string[]
  logo?: MediaRef
  active: boolean
}

export type SlotStatus = "ouvert" | "complet" | "ferme" | "annule"

/** Un créneau réservable : une aventure, une date, un partenaire, un stock. */
export type Slot = {
  id: string
  adventureSlug: string
  partnerSlug: string
  partnerName: string
  /** Date du jour, au format AAAA-MM-JJ. */
  date: string
  heure: string
  places: number
  placesReservees: number
  placesRestantes: number
  /** Prix adulte applicable (celui du créneau, sinon celui de la fiche). */
  prix: number
  statut: SlotStatus
}

export type FaqCategory = "reservation" | "jour-j" | "materiel" | "securite" | "annulation"

export type Faq = {
  id: string
  question: string
  reponse: string
  categorie: FaqCategory
  general: boolean
  adventureSlugs: string[]
}

export type Review = {
  id: string
  auteur: string
  note: 1 | 2 | 3 | 4 | 5
  texte: string
  /** AAAA-MM-JJ */
  date: string
  adventureSlug?: string
}

/** Contenu d'une page éditoriale : texte riche Payload, ou paragraphes de démo. */
export type PageBody =
  | { kind: "lexical"; data: unknown }
  | { kind: "paragraphs"; blocks: Array<{ heading?: string; paragraphs: string[] }> }

export type Page = {
  slug: string
  title: string
  description: string
  body: PageBody
  updatedAt: string
}

export type SiteSettings = {
  email: string
  telephone: string
  adresse: string
  horaires: string
  instagram?: string
  facebook?: string
  raisonSociale: string
  formeJuridique: string
  capital: string
  siret: string
  tva: string
  siegeSocial: string
  directeurPublication: string
  immatriculationTourisme: string
  assuranceRc: string
  delaiAnnulationJours: number
  messageAccueil: string
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "Découverte",
  2: "Facile",
  3: "Soutenu",
  4: "Sportif",
  5: "Engagé",
}

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
  reservation: "Avant de réserver",
  "jour-j": "Le jour J",
  materiel: "Matériel & équipement",
  securite: "Niveau & sécurité",
  annulation: "Annulation & remboursement",
}

export const MESSAGE_MOTIFS = [
  { label: "Réserver une date", value: "reservation" },
  { label: "Groupe ou entreprise", value: "groupe" },
  { label: "Question sur un niveau", value: "niveau" },
  { label: "Autre", value: "autre" },
] as const

export type MessageMotif = (typeof MESSAGE_MOTIFS)[number]["value"]

export const BOOKING_STATUS = [
  { label: "En attente de paiement", value: "en_attente" },
  { label: "Demande à confirmer", value: "demande" },
  { label: "Confirmée", value: "confirmee" },
  { label: "Annulée", value: "annulee" },
  { label: "Remboursée", value: "remboursee" },
] as const

export type BookingStatus = (typeof BOOKING_STATUS)[number]["value"]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = Object.fromEntries(
  BOOKING_STATUS.map((s) => [s.value, s.label]),
) as Record<BookingStatus, string>

/** Une réservation telle que vue par le client (page de confirmation, e-mails). */
export type Booking = {
  id: string
  reference: string
  statut: BookingStatus
  createdAt: string
  adventure: Adventure
  slot: Slot
  nbAdultes: number
  nbEnfants: number
  prenom: string
  nom: string
  email: string
  telephone: string
  message: string
  prixAdulte: number
  prixEnfant?: number
  sousTotal: number
  remise: number
  remiseLibelle: string
  montantTotal: number
  montantCarteCadeau: number
  numeroFacture?: string
  factureEmiseLe?: string
  payeLe?: string
  moyenPaiement?: string
  stripeSessionId?: string
  annuleLe?: string
  montantRembourse?: number
}

export type GiftCardView = {
  id: string
  code: string
  statut: "en_attente" | "active" | "epuisee" | "expiree" | "annulee"
  montantInitial: number
  solde: number
  acheteurNom: string
  acheteurEmail: string
  beneficiaireNom: string
  beneficiaireEmail?: string
  messagePerso?: string
  /** AAAA-MM-JJ */
  expireLe?: string
}

export const GIFT_CARD_AMOUNTS = [60, 90, 120, 180, 250] as const
