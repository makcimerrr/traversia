import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
})

/**
 * Classes de variables de police, appliquées sur <html>. Partagé par le
 * layout du site et par les écrans d'erreur globaux, qui remplacent ce
 * layout et doivent donc redéclarer les polices eux-mêmes.
 */
export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`
