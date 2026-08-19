# Traversia

Site vitrine des « packs aventure » — des itinéraires qui associent randonnée
et canoë sur un même territoire, en Normandie.

Le site sert pour l'instant de présentation : le contenu est figé dans le dépôt
et le formulaire de contact n'envoie rien. La structure de données et le CMS
sont en revanche déjà en place pour prendre le relais.

## Stack

| Brique | Choix |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Interface | Tailwind CSS 4 + shadcn/ui (base Radix) |
| CMS | Payload 3, monté dans la même application |
| Base | PostgreSQL (`@payloadcms/db-postgres`) |
| Médias | Cloudflare R2 via `@payloadcms/storage-s3` |

## Démarrer

```bash
pnpm install
pnpm dev
```

Aucune variable d'environnement n'est nécessaire pour lancer le site : sans
`DATABASE_URI`, les pages servent le contenu de démonstration de
`src/lib/adventures.ts`. `pnpm build` fonctionne également sans base.

## Brancher Payload

1. Copier `.env.example` vers `.env` et renseigner :
   - `PAYLOAD_SECRET` — une chaîne aléatoire longue ;
   - `DATABASE_URI` — un Postgres accessible (Neon, Supabase, local…).
2. `pnpm dev`, puis ouvrir `/admin` pour créer le premier utilisateur.
   Payload crée les tables au premier démarrage.
3. `pnpm seed` injecte les sept parcours de démonstration dans la collection
   `adventures`.
4. `pnpm generate:types` régénère `src/payload-types.ts`.

Dès que `DATABASE_URI` et `PAYLOAD_SECRET` sont présents, `getAdventures()`
lit la collection au lieu du fichier de démo. Si la base est injoignable, le
site retombe sur le contenu de démonstration plutôt que de tomber en erreur.

## Brancher R2

Renseigner `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY` et `R2_PUBLIC_URL`. Sans ces variables, le plugin de
stockage reste inactif et les médias sont écrits sur le disque local.

## Organisation

```
src/
  app/
    (site)/          Pages publiques — layout, accueil, aventures, entreprise, contact
    (payload)/       Administration et API Payload (fichiers générés, à ne pas modifier)
  collections/       Schémas Payload : Adventures, Media, Users
  components/
    adventures/      Fiche parcours, carrousel, jauge de difficulté, cartouche de mesures
    map/             Carte SVG France → Normandie
    site/            En-tête, pied de page, profil altimétrique, primitives de section
    ui/              Composants shadcn/ui
  lib/
    adventures.ts    Contenu de démonstration
    content.ts       Point d'entrée unique du contenu (Payload ou démo)
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
