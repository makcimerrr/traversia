import "server-only"

import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { formatDateLong, formatPrice } from "./format"
import type { Booking, SiteSettings } from "./types"

/**
 * Facture PDF d'une réservation, générée à la demande à partir des
 * données enregistrées (montants figés à la réservation).
 */
export async function invoicePdf(booking: Booking, settings: SiteSettings): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595.28, 841.89]) // A4
  const serif = await pdf.embedFont(StandardFonts.TimesRoman)
  const sans = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const mono = await pdf.embedFont(StandardFonts.Courier)
  const black = rgb(0.08, 0.08, 0.08)
  const grey = rgb(0.45, 0.45, 0.45)
  const line = rgb(0.85, 0.85, 0.85)

  const M = 56
  let y = 841.89 - M

  const text = (t: string, x: number, size: number, font = sans, color = black) => {
    page.drawText(t, { x, y, size, font, color })
  }
  const right = (t: string, xRight: number, size: number, font = sans, color = black) => {
    page.drawText(t, { x: xRight - font.widthOfTextAtSize(t, size), y, size, font, color })
  }
  const rule = (yy: number) => page.drawLine({ start: { x: M, y: yy }, end: { x: 595.28 - M, y: yy }, thickness: 0.6, color: line })

  // En-tête
  text("Traversia", M, 26, serif)
  right("FACTURE", 595.28 - M, 11, mono, grey)
  y -= 16
  right(booking.numeroFacture ?? booking.reference, 595.28 - M, 11, mono)
  y -= 14
  right(`Émise le ${formatDateLong(booking.factureEmiseLe ?? booking.payeLe ?? booking.createdAt.slice(0, 10))}`, 595.28 - M, 9, sans, grey)

  // Émetteur / client
  y -= 40
  const left = [
    settings.raisonSociale || "Traversia",
    ...settings.siegeSocial.split("\n"),
    settings.siret ? `SIRET ${settings.siret}` : "",
    settings.tva ? `TVA ${settings.tva}` : "",
    settings.email,
  ].filter(Boolean)
  const rightCol = [
    `${booking.prenom} ${booking.nom}`,
    booking.email,
    booking.telephone,
    "",
    `Référence ${booking.reference}`,
  ].filter((l) => l !== undefined)
  const top = y
  text("ÉMETTEUR", M, 8, mono, grey)
  y -= 14
  for (const l of left) {
    text(l, M, 10)
    y -= 13
  }
  y = top
  text("CLIENT", 320, 8, mono, grey)
  y -= 14
  for (const l of rightCol) {
    if (l) text(l, 320, 10)
    y -= 13
  }
  y -= 24

  // Prestation
  text("PRESTATION", M, 8, mono, grey)
  y -= 16
  text(booking.adventure.title, M, 14, serif)
  y -= 15
  text(`${formatDateLong(booking.slot.date)} — ${booking.adventure.commune}, ${booking.adventure.departement}`, M, 10, sans, grey)
  y -= 28

  // Lignes
  rule(y + 8)
  y -= 8
  text("Désignation", M, 8, mono, grey)
  right("Qté", 400, 8, mono, grey)
  right("Prix unitaire", 480, 8, mono, grey)
  right("Total", 595.28 - M, 8, mono, grey)
  y -= 8
  rule(y)
  y -= 18

  const lines: Array<[string, number, number, number]> = []
  if (booking.nbAdultes > 0) lines.push(["Adulte", booking.nbAdultes, booking.prixAdulte, booking.nbAdultes * booking.prixAdulte])
  if (booking.nbEnfants > 0) {
    const pu = booking.prixEnfant ?? booking.prixAdulte
    lines.push(["Enfant", booking.nbEnfants, pu, booking.nbEnfants * pu])
  }
  for (const [label, qty, pu, total] of lines) {
    text(label, M, 10)
    right(String(qty), 400, 10, mono)
    right(formatPrice(pu), 480, 10, mono)
    right(formatPrice(total), 595.28 - M, 10, mono)
    y -= 18
  }
  if (booking.remise > 0) {
    text(booking.remiseLibelle || "Remise", M, 10, sans, grey)
    right(`− ${formatPrice(booking.remise)}`, 595.28 - M, 10, mono)
    y -= 18
  }
  rule(y + 6)
  y -= 14
  text("Total TTC", M, 11, bold)
  right(formatPrice(booking.montantTotal), 595.28 - M, 13, bold)
  y -= 16
  if (booking.montantCarteCadeau > 0) {
    text("Dont réglé par carte cadeau", M, 9, sans, grey)
    right(formatPrice(booking.montantCarteCadeau), 595.28 - M, 9, mono, grey)
    y -= 14
    text("Réglé en ligne", M, 9, sans, grey)
    right(formatPrice(Math.max(0, booking.montantTotal - booking.montantCarteCadeau)), 595.28 - M, 9, mono, grey)
    y -= 14
  }
  text(
    settings.tva ? "TVA non applicable, article 293 B du CGI — à adapter selon le régime fiscal." : "TVA non applicable, article 293 B du CGI.",
    M,
    8,
    sans,
    grey,
  )
  y -= 30

  text("PAIEMENT", M, 8, mono, grey)
  y -= 14
  text(
    booking.payeLe
      ? `Réglée le ${formatDateLong(booking.payeLe.slice(0, 10))}${booking.moyenPaiement ? ` (${booking.moyenPaiement})` : ""}.`
      : "En attente de règlement.",
    M,
    10,
  )

  // Pied
  page.drawText(
    [settings.raisonSociale, settings.formeJuridique, settings.capital ? `capital ${settings.capital}` : "", settings.immatriculationTourisme ? `Atout France ${settings.immatriculationTourisme}` : ""]
      .filter(Boolean)
      .join(" — "),
    { x: M, y: M - 10, size: 7.5, font: sans, color: grey },
  )

  return pdf.save()
}
