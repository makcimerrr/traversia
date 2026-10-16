# Traversia

Site vitrine des « packs aventure » — des itinéraires qui associent randonnée
et canoë sur un même territoire, en Normandie.

Le site est en cours de transformation en plateforme de réservation. Le
contenu (aventures, régions, partenaires, créneaux, FAQ, avis, pages légales,
paramètres) est géré dans Payload ; sans base configurée, des données de
démonstration prennent le relais pour que tout fonctionne hors ligne.

## Stack

| Brique | Choix |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Interface | Tailwind CSS 4 + shadcn/ui (base Radix) |
| CMS | Payload 3, monté dans la même application |
| Base | PostgreSQL (`@payloadcms/db-postgres`) |
| Médias | Vercel Blob via `@payloadcms/storage-vercel-blob` |

## Démarrer

```bash
pnpm install
pnpm dev
```

Aucune variable d'environnement n'est nécessaire pour lancer le site : sans
base, les pages servent le contenu de démonstration de `src/lib/adventures.ts`.
`pnpm build` fonctionne également sans base.

Sur une machine liée au projet Vercel, `vercel env pull .env` récupère les
variables réelles (base Neon, jeton Blob, secret Payload).

## Brancher Payload

1. Copier `.env.example` vers `.env` et renseigner :
   - `PAYLOAD_SECRET` — une chaîne aléatoire longue ;
   - `DATABASE_URL` — un Postgres accessible. `DATABASE_URI` est également
     accepté si vous préférez ce nom.
2. `pnpm dev`, puis ouvrir `/admin` pour créer le premier utilisateur.
   Payload crée les tables au premier démarrage.
3. `pnpm seed` injecte le contenu de démonstration : régions, partenaires,
   sept parcours, créneaux sur six mois, FAQ, avis, pages légales, paramètres.
   Le script est idempotent ; il ne réécrit jamais un créneau ou une page
   existants.
4. `pnpm generate:types` régénère `src/payload-types.ts` après toute
   modification d'une collection.

### Schéma de base

En développement, Payload pousse le schéma dans la base au démarrage
(mode « push » de Drizzle). Quand une modification entraîne une perte de
données (colonne supprimée, colonne obligatoire ajoutée sur une table
remplie), Drizzle demande confirmation dans le terminal. Pour un script
non interactif, `printf 'y\n' | PAYLOAD_FORCE_DRIZZLE_PUSH=true pnpm seed`
accepte l'avertissement. En cas d'ambiguïté (« enum créé ou renommé ? »),
supprimer d'abord la colonne obsolète en SQL.

Dès que la base et `PAYLOAD_SECRET` sont présents, `getAdventures()`
lit la collection au lieu du fichier de démo. Si la base est injoignable, le
site retombe sur le contenu de démonstration plutôt que de tomber en erreur.

## Réservation et paiement

Le tunnel (`/aventures/[slug]/reserver`) crée une réservation dans Payload
puis redirige vers Stripe Checkout (carte, Apple Pay, Google Pay). Le
webhook `/api/stripe/webhook` confirme la réservation, envoie l'e-mail de
confirmation (Resend) et libère les places si la session expire. La page
`/reservation/[référence]` vérifie elle-même la session au retour de Stripe,
sans attendre le webhook.

Les clés viennent du Marketplace Vercel :

```bash
vercel integration add stripe
vercel integration add resend/resend-email
vercel env pull .env
```

Le secret du webhook (`STRIPE_WEBHOOK_SECRET`) se crée dans le tableau de
bord Stripe. En local, `stripe listen --forward-to localhost:3000/api/stripe/webhook`
fournit un secret de test.

Sans `STRIPE_SECRET_KEY`, le tunnel fonctionne en mode « demande » : la
réservation est enregistrée et confirmée à la main dans l'administration.
`pnpm smoke:booking` rejoue ce parcours de bout en bout sur la base.

Le stock d'un créneau (`placesReservees`) est recalculé à chaque changement
de réservation ; les statuts « en attente », « demande » et « confirmée »
occupent des places.

### Après la réservation

- `/reservation/[référence]` : récapitulatif, horaires, matériel, infos
  pratiques, trace GPX, QR code (`/qr`) et facture PDF (`/facture`,
  numérotée `FAC-AAAA-NNNN` à la confirmation).
- Annulation par le client depuis cette page, gratuite et remboursée via
  Stripe jusqu'au délai fixé dans les paramètres du site ; au-delà, il est
  invité à écrire.
- Annulation par l'équipe : bouton « Annuler et rembourser » dans la fiche
  réservation de l'administration (endpoint `POST /api/bookings/:id/annuler`).

### Codes promo et cartes cadeaux

Les codes promotionnels (pourcentage ou montant, bornes de dates, nombre
d'utilisations, restriction par aventure) et les cartes cadeaux se saisissent
dans le même champ du tunnel. Une carte cadeau s'achète sur
`/cartes-cadeaux` (Stripe), arrive par e-mail avec un code `CADEAU-XXXX-XXXX`
et se consomme en une ou plusieurs fois ; le solde est recrédité en cas
d'annulation.

## Comptes clients et API pour l'application mobile

Le compte client est créé au premier paiement confirmé : l'e-mail de
confirmation contient un lien (valable deux jours) pour définir le mot de
passe. Le client se connecte ensuite sur `/compte` ou dans l'application
avec le même identifiant. Un lien se redemande depuis `/compte`.

Les droits sont stricts : un client ne lit que sa fiche et ses
réservations ; tout le reste est réservé aux administrateurs
(`src/lib/access.ts`).

API JSON (Payload) utilisée par l'application :

| Appel | Rôle |
| --- | --- |
| `POST /api/customers/login` `{ email, password }` | Connexion, renvoie `token` (JWT) et `user` |
| `GET /api/customers/me` | Profil du client connecté (`Authorization: JWT <token>`) |
| `POST /api/customers/lien-connexion` `{ email }` | Envoi d'un lien pour définir le mot de passe |
| `GET /api/bookings?depth=2&sort=-createdAt` | Réservations du client connecté, aventure et créneau inclus |
| `GET /reservation/<référence>/facture` | Facture PDF |
| `GET /api/bookings/<id>/trace` | Fichier GPX, uniquement à partir de l'heure d'ouverture (`423` avec `ouvreLe` avant) |

L'heure d'ouverture du tracé est le rendez-vous moins le délai « Tracé GPX
disponible » des paramètres du site (trois heures par défaut). La position
en temps réel reste sur le téléphone : rien ne remonte au serveur.

## Marketing et référencement

- Journal (`/blog`) alimenté par la collection Articles ; lettre
  d'information (collection Abonnés, formulaire du pied de page) ; avis
  déposés par les clients après la sortie, publiés après relecture.
- `sitemap.xml` et `robots.txt` générés ; données structurées schema.org
  (organisation, parcours avec prix et note moyenne, FAQ, articles, fil
  d'Ariane) ; vérification Search Console depuis les paramètres du site.
- Google Analytics 4 et Meta Pixel se configurent dans les paramètres du
  site (onglet Marketing) et ne se chargent qu'après consentement via le
  bandeau cookies.

## Médias

Les fichiers vont sur Vercel Blob, via `BLOB_READ_WRITE_TOKEN` (injecté
automatiquement par le store Blob lié au projet). Sans ce jeton, le plugin
reste inactif et les fichiers sont écrits sur le disque local — ce qui ne vaut
qu'en développement, le système de fichiers étant en lecture seule sur Vercel.

## Organisation

```
src/
  app/
    (site)/          Pages publiques — accueil, aventures, concept, à propos,
                     partenaires, FAQ, contact, pages éditoriales /[slug]
    (payload)/       Administration et API Payload (fichiers générés, à ne pas modifier)
  collections/       Schémas Payload : Adventures, Slots (créneaux), Bookings,
                     Customers, PromoCodes, GiftCards, Regions, Partners,
                     Faqs, Reviews, Pages, Posts, Messages, Subscribers,
                     Media, Users
  globals/           SiteSettings : coordonnées, informations légales
  components/
    adventures/      Fiche parcours, carrousel, jauge de difficulté, cartouche de mesures
    map/             Carte SVG France → Normandie
    site/            En-tête, pied de page, profil altimétrique, primitives de section
    ui/              Composants shadcn/ui
  lib/
    adventures.ts    Aventures de démonstration
    demo.ts          Régions, partenaires, créneaux, FAQ, avis, pages de démo
    content.ts       Point d'entrée unique du contenu (Payload ou démo)
    payload.ts       Accès Payload partagé et bascule démo
    revalidate.ts    Crochets d'invalidation du cache après édition admin
    format.ts        Dates et prix en français
    pricing.ts       Devis d'une réservation (adultes, enfants, remises)
    bookings.ts      Service de réservation : création, confirmation, expiration
    bookings-stock.ts Recalcul du stock d'un créneau
    stripe.ts        Client Stripe
    email.ts         Envoi Resend et gabarits d'e-mails
    discounts.ts     Résolution d'un code promo ou d'une carte cadeau
    gift-cards.ts    Achat et activation des cartes cadeaux
    invoice.ts       Facture PDF (pdf-lib)
    qr.ts            QR code de réservation
    actions/         Server actions (contact, réservation)
  app/api/stripe/webhook  Webhook Stripe
    france-map.ts    Tracés SVG générés — ne pas éditer à la main
    types.ts         Types du domaine
  scripts/seed.ts    Injection du contenu de démonstration dans Payload
```

## Parti pris graphique

Monochrome strict : toutes les couleurs sont définies en `oklch(L 0 0)`, sans
chrominance. La hiérarchie repose sur la valeur, les filets, les hachures et la
typographie — serif de titrage (Instrument Serif), sans-serif de labeur (Geist)
et monospace pour les micro-libellés, à la façon d'une légende de carte.

Les angles sont droits (`--radius: 0`), les animations réduites au strict
nécessaire : le zoom de la carte et les changements d'état. `prefers-reduced-motion`
les neutralise.

### La carte

`src/lib/france-map.ts` est généré à partir des contours de
[france-geojson](https://github.com/gregoiredavid/france-geojson), projetés en
conique conforme dans un `viewBox` de 1000 × 1000. Le zoom est une transformation
CSS appliquée au groupe de fond ; les repères de parcours vivent dans un calque
séparé pour garder une taille constante, et grossissent sur petit écran via
`--marker-scale`.

Pour ajouter un point de départ, ajouter ses coordonnées à `SPOT_XY` puis son
identifiant à la liste `spotId` de `src/collections/Adventures.ts`.
