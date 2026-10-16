import type { CollectionConfig } from "payload"

import { cancelBookingEndpoint } from "../lib/bookings-admin"
import { syncSlotStock } from "../lib/bookings-stock"
import { revalidateAfterChange, revalidateAfterDelete } from "../lib/revalidate"
import { BOOKING_STATUS } from "../lib/types"

/** Référence lisible et difficile à deviner : TRV-2027-K7M3Q. */
export function makeReference(date = new Date()): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `TRV-${date.getFullYear()}-${code}`
}

/**
 * Une réservation : un client, un créneau, des participants, un paiement.
 * Le stock du créneau (placesReservees) est recalculé après chaque
 * changement ; « en attente », « demande » et « confirmée » occupent des places.
 */
export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: {
    group: "Réservations",
    useAsTitle: "reference",
    defaultColumns: ["reference", "adventure", "slot", "nbAdultes", "nbEnfants", "montantTotal", "statut"],
    listSearchableFields: ["reference", "email", "nom", "prenom", "numeroFacture"],
    components: {
      edit: {
        beforeDocumentControls: ["@/components/admin/cancel-booking-button#CancelBookingButton"],
      },
    },
  },
  endpoints: [cancelBookingEndpoint],
  labels: { singular: "Réservation", plural: "Réservations" },
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
        if (data && !data.reference) data.reference = makeReference()
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const slotId = typeof doc.slot === "object" ? doc.slot.id : doc.slot
        await syncSlotStock(req.payload, slotId, req)
        const previousSlot =
          previousDoc && (typeof previousDoc.slot === "object" ? previousDoc.slot.id : previousDoc.slot)
        if (previousSlot && previousSlot !== slotId) await syncSlotStock(req.payload, previousSlot, req)
        return doc
      },
      revalidateAfterChange,
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const slotId = typeof doc.slot === "object" ? doc.slot.id : doc.slot
        await syncSlotStock(req.payload, slotId, req)
        return doc
      },
      revalidateAfterDelete,
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "reference",
          type: "text",
          unique: true,
          index: true,
          label: "Référence",
          admin: { readOnly: true, width: "40%" },
        },
        {
          name: "statut",
          type: "select",
          required: true,
          defaultValue: "en_attente",
          options: [...BOOKING_STATUS],
          label: "Statut",
          admin: { width: "60%" },
        },
      ],
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Réservation",
          fields: [
            {
              type: "row",
              fields: [
                { name: "slot", type: "relationship", relationTo: "slots", required: true, label: "Créneau" },
                { name: "adventure", type: "relationship", relationTo: "adventures", required: true, label: "Aventure" },
                { name: "partner", type: "relationship", relationTo: "partners", label: "Partenaire" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "nbAdultes", type: "number", required: true, min: 0, defaultValue: 1, label: "Adultes" },
                { name: "nbEnfants", type: "number", required: true, min: 0, defaultValue: 0, label: "Enfants" },
              ],
            },
            { name: "message", type: "textarea", label: "Message du client" },
          ],
        },
        {
          label: "Client",
          fields: [
            { name: "customer", type: "relationship", relationTo: "customers", label: "Fiche client" },
            {
              type: "row",
              fields: [
                { name: "prenom", type: "text", required: true, label: "Prénom" },
                { name: "nom", type: "text", required: true, label: "Nom" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "email", type: "email", required: true, label: "Courriel" },
                { name: "telephone", type: "text", label: "Téléphone" },
              ],
            },
          ],
        },
        {
          label: "Montant",
          fields: [
            {
              type: "row",
              fields: [
                { name: "prixAdulte", type: "number", required: true, label: "Prix adulte (€)" },
                { name: "prixEnfant", type: "number", label: "Prix enfant (€)" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "sousTotal", type: "number", required: true, label: "Sous-total (€)" },
                { name: "remise", type: "number", defaultValue: 0, label: "Remise (€)" },
                { name: "montantTotal", type: "number", required: true, label: "Total (€)" },
              ],
            },
            { name: "remiseLibelle", type: "text", label: "Libellé de la remise" },
            {
              type: "row",
              fields: [
                { name: "promoCode", type: "relationship", relationTo: "promo-codes", label: "Code promotionnel" },
                { name: "giftCard", type: "relationship", relationTo: "gift-cards", label: "Carte cadeau" },
                { name: "montantCarteCadeau", type: "number", defaultValue: 0, label: "Réglé par carte cadeau (€)" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "numeroFacture", type: "text", label: "N° de facture", admin: { readOnly: true } },
                { name: "factureEmiseLe", type: "date", label: "Facture émise le", admin: { readOnly: true } },
              ],
            },
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
              ],
            },
            {
              type: "row",
              fields: [
                { name: "payeLe", type: "date", label: "Payé le", admin: { readOnly: true } },
                { name: "moyenPaiement", type: "text", label: "Moyen de paiement", admin: { readOnly: true } },
              ],
            },
            { name: "confirmationEnvoyeeLe", type: "date", label: "Confirmation envoyée le", admin: { readOnly: true } },
          ],
        },
        {
          label: "Annulation",
          fields: [
            {
              type: "row",
              fields: [
                { name: "annuleLe", type: "date", label: "Annulée le" },
                { name: "montantRembourse", type: "number", label: "Montant remboursé (€)" },
                { name: "stripeRefundId", type: "text", label: "Remboursement Stripe", admin: { readOnly: true } },
              ],
            },
            { name: "motifAnnulation", type: "textarea", label: "Motif" },
          ],
        },
      ],
    },
    { name: "notes", type: "textarea", label: "Notes internes", admin: { position: "sidebar" } },
  ],
}
