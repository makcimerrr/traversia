/** Formats partagés : dates et prix, en français, indépendants du fuseau de la machine. */

const PARIS = "Europe/Paris"

/** "samedi 12 juin 2027" à partir d'une clé AAAA-MM-JJ. */
export function formatDateLong(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00.000Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: PARIS,
  })
}

/** "sam. 12 juin" */
export function formatDateShort(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00.000Z`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: PARIS,
  })
}

/** "juin 2027" */
export function formatMonth(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00.000Z`).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: PARIS,
  })
}

/** "89 €" ou "89,50 €" */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** "7 h" ou "7 h 30" */
export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`
}
