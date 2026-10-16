import type { GlobalConfig } from "payload"

import { revalidateGlobal } from "../lib/revalidate"

/** Coordonnées et informations légales, reprises dans le pied de page et les pages légales. */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  hooks: { afterChange: [revalidateGlobal] },
  label: "Paramètres du site",
  admin: { group: "Administration" },
  access: { read: () => true },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Coordonnées",
          fields: [
            { name: "email", type: "email", required: true, label: "Courriel de contact" },
            { name: "telephone", type: "text", label: "Téléphone" },
            { name: "adresse", type: "textarea", label: "Adresse du bureau" },
            { name: "horaires", type: "text", label: "Saison / horaires" },
            {
              type: "row",
              fields: [
                { name: "instagram", type: "text", label: "Instagram (URL)" },
                { name: "facebook", type: "text", label: "Facebook (URL)" },
              ],
            },
          ],
        },
        {
          label: "Informations légales",
          fields: [
            { name: "raisonSociale", type: "text", label: "Raison sociale" },
            {
              type: "row",
              fields: [
                { name: "formeJuridique", type: "text", label: "Forme juridique" },
                { name: "capital", type: "text", label: "Capital social" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "siret", type: "text", label: "SIRET" },
                { name: "tva", type: "text", label: "N° TVA intracommunautaire" },
              ],
            },
            { name: "siegeSocial", type: "textarea", label: "Siège social" },
            { name: "directeurPublication", type: "text", label: "Directeur de la publication" },
            { name: "immatriculationTourisme", type: "text", label: "Immatriculation Atout France" },
            { name: "assuranceRc", type: "text", label: "Assurance RC professionnelle" },
          ],
        },
        {
          label: "Marketing",
          description: "Les scripts de mesure ne se chargent qu'après consentement du visiteur.",
          fields: [
            { name: "gaId", type: "text", label: "Identifiant Google Analytics 4", admin: { description: "Ex. G-XXXXXXXXXX" } },
            { name: "metaPixelId", type: "text", label: "Identifiant Meta Pixel" },
            {
              name: "googleSiteVerification",
              type: "text",
              label: "Code de vérification Google Search Console",
              admin: { description: "Le contenu de la balise meta google-site-verification." },
            },
          ],
        },
        {
          label: "Réservation",
          fields: [
            {
              name: "delaiAnnulationJours",
              type: "number",
              defaultValue: 7,
              label: "Annulation gratuite jusqu'à (jours avant)",
            },
            {
              name: "ouvertureTraceHeures",
              type: "number",
              defaultValue: 3,
              min: 0,
              label: "Tracé GPX disponible (heures avant le départ)",
              admin: { description: "Dans l'application, le tracé se déverrouille ce nombre d'heures avant l'heure de rendez-vous." },
            },
            {
              name: "messageAccueil",
              type: "textarea",
              label: "Message affiché sur l'accueil",
              admin: { description: "Ex. « Le calendrier 2027 ouvre en février. »" },
            },
          ],
        },
      ],
    },
  ],
}
