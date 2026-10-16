import type { CollectionConfig } from "payload"

export const GIFT_CARD_STATUS = [
  { label: "En attente de paiement", value: "en_attente" },
  { label: "Active", value: "active" },
  { label: "Épuisée", value: "epuisee" },
  { label: "Expirée", value: "expiree" },
  { label: "Annulée", value: "annulee" },
] as const

/** Code lisible : CADEAU-7K3M-Q9XP */
export function makeGiftCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const block = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
  return `CADEAU-${block()}-${block()}`
}

/**
 * Une carte cadeau : un montant acheté en ligne, un solde consommé au fil
 * des réservations, une date d'expiration (douze mois par défaut).
 */
export const GiftCards: CollectionConfig = {
  slug: "gift-cards",
  admin: {
    group: "Réservations",
    useAsTitle: "code",
    defaultColumns: ["code", "montantInitial", "solde", "statut", "beneficiaireNom", "expireLe"],
    listSearchableFields: ["code", "acheteurEmail", "beneficiaireEmail", "beneficiaireNom"],
  },
  labels: { singular: "Carte cadeau", plural: "Cartes cadeaux" },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: "-createdAt",
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        if (!data.code) data.code = makeGiftCode()
        if (typeof data.solde !== "number" && typeof data.montantInitial === "number") data.solde = data.montantInitial
        if (!data.expireLe && data.payeLe) {
          const d = new Date(data.payeLe)
          d.setFullYear(d.getFullYear() + 1)
          data.expireLe = d.toISOString()
        }
        if (data.statut === "active" && typeof data.solde === "number" && data.solde <= 0) data.statut = "epuisee"
        return data
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "code", type: "text", unique: true, index: true, label: "Code", admin: { readOnly: true, width: "50%" } },
        {
          name: "statut",
          type: "select",
          required: true,
          defaultValue: "en_attente",
          options: [...GIFT_CARD_STATUS],
          label: "Statut",
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "montantInitial", type: "number", required: true, min: 1, label: "Montant (€)" },
        { name: "solde", type: "number", min: 0, label: "Solde (€)", admin: { description: "Vide à la création : égal au montant." } },
        {
          name: "expireLe",
          type: "date",
          label: "Expire le",
          admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" }, description: "Vide : un an après le paiement." },
        },
      ],
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Acheteur",
          fields: [
            {
              type: "row",
              fields: [
                { name: "acheteurNom", type: "text", label: "Nom" },
                { name: "acheteurEmail", type: "email", label: "Courriel" },
              ],
            },
          ],
        },
        {
          label: "Bénéficiaire",
          fields: [
            {
              type: "row",
              fields: [
                { name: "beneficiaireNom", type: "text", label: "Nom" },
                { name: "beneficiaireEmail", type: "email", label: "Courriel", admin: { description: "Si renseigné, la carte lui est envoyée directement." } },
              ],
            },
            { name: "messagePerso", type: "textarea", label: "Message personnel" },
          ],
        },
        {
          label: "Paiement",
          fields: [
            {
              type: "row",
              fields: [
                { name: "stripeSessionId", type: "text", label: "Session Stripe", admin: { readOnly: true } },
                { name: "stripePaymentIntentId", type: "text", label: "Paiement Stripe", admin: { readOnly: true } },
                { name: "payeLe", type: "date", label: "Payée le", admin: { readOnly: true } },
              ],
            },
            { name: "envoyeeLe", type: "date", label: "Envoyée le", admin: { readOnly: true } },
          ],
        },
      ],
    },
    { name: "bookings", type: "join", collection: "bookings", on: "giftCard", label: "Réservations réglées avec cette carte" },
    { name: "notes", type: "textarea", label: "Notes internes", admin: { position: "sidebar" } },
  ],
}
