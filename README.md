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
  collections/       Schémas Payload : Adventures, Slots (créneaux), Regions,
                     Partners, Faqs, Reviews, Pages, Messages, Media, Users
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
    actions/         Server actions (formulaire de contact)
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
