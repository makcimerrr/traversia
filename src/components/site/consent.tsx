"use client"

import Script from "next/script"
import Link from "next/link"
import { useSyncExternalStore } from "react"

/**
 * Consentement aux cookies de mesure d'audience. Le choix est conservé
 * dans le navigateur ; les scripts (Google Analytics, Meta Pixel) ne se
 * chargent qu'une fois le consentement donné, et jamais sans identifiant.
 */

const KEY = "traversia-consent"
const EVENT = "traversia-consent-change"
type Choice = "granted" | "denied"

function readChoice(): Choice | null {
  try {
    const v = window.localStorage.getItem(KEY)
    return v === "granted" || v === "denied" ? v : null
  } catch {
    return null
  }
}

function writeChoice(choice: Choice | null) {
  try {
    if (choice) window.localStorage.setItem(KEY, choice)
    else window.localStorage.removeItem(KEY)
  } catch {
    // Stockage indisponible : le bandeau reviendra à la prochaine visite.
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

/** Choix courant, synchronisé entre les composants et les onglets ; inconnu côté serveur. */
function useConsent(): Choice | null | undefined {
  return useSyncExternalStore(subscribe, readChoice, () => undefined)
}

export function CookieBanner({ enabled }: { enabled: boolean }) {
  const choice = useConsent()
  if (!enabled || choice !== null) return null
  const choose = (choice: Choice) => writeChoice(choice)

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-xl border border-foreground bg-background p-5 shadow-none sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <p className="label text-muted-foreground">Cookies</p>
      <p className="mt-3 text-sm leading-relaxed">
        Nous utilisons des cookies de mesure d&apos;audience pour comprendre quels parcours vous intéressent.
        Aucun n&apos;est déposé sans votre accord.{" "}
        <Link href="/confidentialite" className="link-underline">
          En savoir plus
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="border border-foreground bg-foreground px-4 py-2.5 label text-background transition-colors hover:bg-background hover:text-foreground"
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="border border-border px-4 py-2.5 label transition-colors hover:border-foreground"
        >
          Refuser
        </button>
      </div>
    </div>
  )
}

export function Analytics({ gaId, metaPixelId }: { gaId?: string; metaPixelId?: string }) {
  const granted = useConsent() === "granted"
  if (!granted) return null

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId.replace(/[^A-Za-z0-9-]/g, "")}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId.replace(/[^0-9]/g, "")}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}

/** Lien « Gérer les cookies » du pied de page : rouvre le choix. */
export function ManageCookiesLink() {
  return (
    <button
      type="button"
      onClick={() => writeChoice(null)}
      className="link-underline text-left"
    >
      Gérer les cookies
    </button>
  )
}
