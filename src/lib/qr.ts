import "server-only"

import QRCode from "qrcode"

/** QR code PNG (noir sur blanc) pointant vers une URL. */
export async function qrPng(url: string, size = 480): Promise<Buffer> {
  return QRCode.toBuffer(url, { type: "png", width: size, margin: 1, errorCorrectionLevel: "M" })
}
