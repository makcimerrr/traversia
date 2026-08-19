/** Niveau de difficulté, de 1 (accessible à tous) à 5 (engagé). */
export type Difficulty = 1 | 2 | 3 | 4 | 5

export type Discipline = "randonnee" | "canoe"

export type ProgrammeStep = {
  /** Repère horaire ou séquence, ex. "09h00" ou "Jour 2". */
  time: string
  title: string
  detail: string
}

export type Adventure = {
  slug: string
  /** Clé de position sur la carte — voir SPOT_XY dans france-map.ts. */
  spotId: string
  regionCode: string
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
  stats: {
    distanceKm: number
    randoKm: number
    canoeKm: number
    deniveleM: number
    /** Durée totale sur le terrain, en heures. */
    dureeH: number
    /** Nombre de jours (1 = à la journée). */
    jours: number
  }
  saison: string
  groupe: string
  prix: number
  temps_forts: string[]
  programme: ProgrammeStep[]
  inclus: string[]
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "Découverte",
  2: "Facile",
  3: "Soutenu",
  4: "Sportif",
  5: "Engagé",
}
