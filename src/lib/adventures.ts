import type { Adventure, PracticalInfo, RendezVous } from "./types"

/**
 * Contenu de démonstration. Même forme que ce que renvoie la collection
 * Payload `adventures` — voir src/lib/content.ts pour la bascule.
 *
 * Le récit de chaque parcours est dans BASE ; les informations pratiques,
 * propres à chaque fiche, sont dans EXTRAS, et les valeurs communes dans
 * COMMON. ADVENTURES, exporté en bas de fichier, assemble les trois.
 */
type Base = Omit<
  Adventure,
  | "regionCode"
  | "regionSlug"
  | "regionName"
  | "partnerSlug"
  | "partnerName"
  | "niveauConseille"
  | "ageMin"
  | "prixEnfant"
  | "ageEnfantMax"
  | "placesParDefaut"
  | "minParticipants"
  | "maxParticipants"
  | "nonInclus"
  | "equipement"
  | "pratique"
  | "rendezVous"
  | "gallery"
  | "stats"
> & {
  stats: Omit<Adventure["stats"], "tempsRandoH" | "tempsCanoeH">
}

const BASE: Base[] = [
  {
    slug: "suisse-normande",
    spotId: "clecy-suisse-normande",
    title: "La Suisse Normande",
    tagline: "Les crêtes de Clécy le matin, l'Orne au fil de l'eau l'après-midi",
    commune: "Clécy",
    departement: "Calvados",
    intro:
      "On grimpe d'abord sur les Rochers des Parcs, cette barre de grès qui surplombe la boucle de l'Orne et qui a valu à la vallée son surnom d'alpage normand. Le sentier serpente entre bruyère et chaos rocheux, jusqu'au belvédère où toute la vallée se déplie d'un coup. L'après-midi, on redescend au niveau de l'eau : deux heures de canoë sur une rivière large et calme, à regarder défiler par en-dessous les falaises qu'on avait sous les pieds.",
    difficulty: 3,
    niveau: "Soutenu",
    stats: { distanceKm: 21, randoKm: 12.5, canoeKm: 8.5, deniveleM: 480, dureeH: 7, jours: 1 },
    saison: "Avril → Octobre",
    groupe: "4 à 12 personnes",
    prix: 89,
    temps_forts: [
      "Belvédère des Rochers des Parcs",
      "Passage du Pain de Sucre",
      "Boucle de l'Orne en canoë biplace",
    ],
    programme: [
      { time: "08h30", title: "Départ de Clécy", detail: "Accueil au bourg, café, briefing carte et sécurité." },
      { time: "09h00", title: "Montée aux Rochers des Parcs", detail: "12,5 km de crête, 480 m de dénivelé positif, trois points de vue sur la vallée." },
      { time: "12h30", title: "Déjeuner au bord de l'eau", detail: "Pause pique-nique à la base nautique, produits normands." },
      { time: "14h00", title: "Descente de l'Orne", detail: "8,5 km de canoë sur une eau de classe I, portage nul, arrêt baignade selon la saison." },
      { time: "17h00", title: "Retour navette", detail: "Récupération des véhicules au point de départ." },
    ],
    inclus: ["Guide diplômé", "Canoë, pagaie et gilet", "Navette retour", "Topo-guide papier"],
  },
  {
    slug: "roche-d-oetre",
    spotId: "pont-douilly-oetre",
    title: "La Roche d'Oëtre",
    tagline: "Le plus haut point de vue de l'Ouest, puis les gorges de la Rouvre",
    commune: "Pont-d'Ouilly",
    departement: "Orne",
    intro:
      "La Roche d'Oëtre tombe de 118 mètres d'un seul tenant au-dessus des gorges de la Rouvre. On la prend par le sentier des Corniches, celui qui reste au bord du vide, avant de basculer dans la forêt versant nord. En bas, la Rouvre se navigue en canoë dans un couloir de verdure où l'on ne croise plus personne. C'est le tracé le plus vertical du catalogue, et le plus silencieux.",
    difficulty: 4,
    niveau: "Sportif",
    stats: { distanceKm: 26, randoKm: 16, canoeKm: 10, deniveleM: 720, dureeH: 8, jours: 1 },
    saison: "Mai → Septembre",
    groupe: "4 à 10 personnes",
    prix: 105,
    temps_forts: [
      "Sentier des Corniches en balcon",
      "Panorama à 118 m au-dessus de la Rouvre",
      "Gorges de la Rouvre en canoë",
    ],
    programme: [
      { time: "08h00", title: "Rendez-vous à Pont-d'Ouilly", detail: "Équipement, contrôle du matériel, lecture du profil de la journée." },
      { time: "08h45", title: "Sentier des Corniches", detail: "16 km de balcon rocheux, 720 m de dénivelé, deux passages câblés." },
      { time: "13h00", title: "Déjeuner au belvédère", detail: "Pause longue face aux gorges." },
      { time: "14h30", title: "Descente de la Rouvre", detail: "10 km encaissés, deux seuils faciles, un portage court." },
      { time: "18h00", title: "Fin de parcours", detail: "Retour au village, débriefing." },
    ],
    inclus: ["Guide diplômé", "Canoë et matériel de sécurité", "Navette", "Encas de mi-parcours"],
  },
  {
    slug: "boucle-de-la-seine",
    spotId: "les-andelys-seine",
    title: "La Boucle des Andelys",
    tagline: "Château Gaillard en surplomb, la Seine en contrebas",
    commune: "Les Andelys",
    departement: "Eure",
    intro:
      "Richard Cœur de Lion a posé Château Gaillard exactement là où il fallait : sur l'éperon crayeux qui commande le méandre. La montée se fait par les côtes blanches, à travers pelouses calcaires et buis. Ensuite, on navigue la boucle par en bas, dans le fleuve, avec la forteresse qui tourne lentement au-dessus de la tête. Un itinéraire large, accessible, très photogénique.",
    difficulty: 2,
    niveau: "Facile",
    stats: { distanceKm: 18, randoKm: 8, canoeKm: 10, deniveleM: 260, dureeH: 6, jours: 1 },
    saison: "Mars → Novembre",
    groupe: "4 à 16 personnes",
    prix: 74,
    temps_forts: [
      "Ruines de Château Gaillard",
      "Côtes blanches et pelouses calcaires",
      "Traversée du méandre en canoë",
    ],
    programme: [
      { time: "09h00", title: "Accueil au Petit Andely", detail: "Présentation du site et de son histoire." },
      { time: "09h30", title: "Montée à Château Gaillard", detail: "8 km, 260 m de dénivelé, sentier large et roulant." },
      { time: "12h30", title: "Déjeuner sur les berges", detail: "Pique-nique face au fleuve." },
      { time: "14h00", title: "Navigation de la boucle", detail: "10 km sur eau plate, courant porteur, aucune difficulté technique." },
      { time: "16h30", title: "Débarquement", detail: "Retour au point de départ à pied, 10 minutes." },
    ],
    inclus: ["Guide diplômé", "Canoë et gilet", "Livret historique", "Boisson d'arrivée"],
  },
  {
    slug: "cote-d-albatre",
    spotId: "etretat-albatre",
    title: "La Côte d'Albâtre",
    tagline: "Les falaises d'Étretat par le GR21, la mer par en dessous",
    commune: "Étretat",
    departement: "Seine-Maritime",
    intro:
      "Le seul parcours du catalogue qui se termine en mer. On suit le GR21 depuis la falaise d'Amont, on passe l'aiguille creuse, on continue jusqu'à la valleuse de Bruneval. L'après-midi, kayak de mer au pied des falaises : on entre dans les arches, on longe la craie à quelques mètres, et l'échelle du site devient soudain très concrète. Sortie conditionnée à la météo et à la marée.",
    difficulty: 4,
    niveau: "Sportif",
    stats: { distanceKm: 23, randoKm: 15, canoeKm: 8, deniveleM: 640, dureeH: 8, jours: 1 },
    saison: "Juin → Septembre",
    groupe: "4 à 8 personnes",
    prix: 118,
    temps_forts: [
      "Falaise d'Amont et aiguille creuse",
      "Passage sous la Porte d'Aval en kayak",
      "Valleuse de Bruneval",
    ],
    programme: [
      { time: "08h30", title: "Départ d'Étretat", detail: "Point météo et marée, ajustement du parcours." },
      { time: "09h00", title: "GR21 vers le nord", detail: "15 km de sentier littoral, 640 m de dénivelé cumulé." },
      { time: "13h00", title: "Déjeuner en valleuse", detail: "Pause abritée du vent." },
      { time: "14h30", title: "Kayak de mer", detail: "8 km le long des falaises, passage des arches si la mer le permet." },
      { time: "18h00", title: "Retour plage", detail: "Rangement du matériel, débriefing." },
    ],
    inclus: ["Guide diplômé mer", "Kayak, jupe et combinaison", "Bulletin météo marine", "Navette"],
  },
  {
    slug: "baie-du-mont",
    spotId: "baie-mont-saint-michel",
    title: "La Baie du Mont",
    tagline: "Traversée des grèves à pied, remontée du Couesnon à la pagaie",
    commune: "Genêts",
    departement: "Manche",
    intro:
      "La traversée de la baie depuis Genêts est un classique qu'on ne fait jamais deux fois pareil : le sable change de place, les chenaux se déplacent, et le Mont grossit lentement pendant trois heures. On la fait à marée descendante, pieds nus, avec un guide qui connaît les sables mouvants. Puis on remonte le Couesnon en canoë au moment du flot, ce qui n'est possible que quelques heures par jour.",
    difficulty: 3,
    niveau: "Soutenu",
    stats: { distanceKm: 20, randoKm: 13, canoeKm: 7, deniveleM: 40, dureeH: 7, jours: 1 },
    saison: "Avril → Octobre",
    groupe: "6 à 20 personnes",
    prix: 92,
    temps_forts: [
      "Traversée des grèves pieds nus",
      "Lecture des sables mouvants",
      "Remontée du Couesnon à la pagaie",
    ],
    programme: [
      { time: "Marée −4h", title: "Rassemblement à Genêts", detail: "L'horaire dépend du coefficient : il est communiqué la veille." },
      { time: "+0h30", title: "Entrée dans la baie", detail: "13 km sur l'estran, passage de la Sée et de la Sélune." },
      { time: "+3h30", title: "Pause au pied du Mont", detail: "Déjeuner et temps libre." },
      { time: "+5h00", title: "Canoë sur le Couesnon", detail: "7 km à la remontée du flot, plat intégral." },
      { time: "+7h00", title: "Retour navette", detail: "Récupération à Genêts." },
    ],
    inclus: ["Guide de baie agréé", "Canoë et gilet", "Navette retour", "Horaires de marée personnalisés"],
  },
  {
    slug: "vallee-de-l-eure",
    spotId: "vallee-de-leure",
    title: "La Vallée de l'Eure",
    tagline: "Une première fois en douceur, à l'ombre des moulins",
    commune: "Acquigny",
    departement: "Eure",
    intro:
      "Le format d'entrée : une demi-journée de marche sur les coteaux d'Acquigny, une demi-journée de canoë sur une Eure lente et bordée de moulins. Pas de difficulté technique, pas de portage, un dénivelé de promenade. C'est le parcours qu'on conseille pour une première sortie, en famille ou en groupe qui ne se connaît pas encore.",
    difficulty: 1,
    niveau: "Découverte",
    stats: { distanceKm: 14, randoKm: 6, canoeKm: 8, deniveleM: 120, dureeH: 5, jours: 1 },
    saison: "Mars → Novembre",
    groupe: "4 à 20 personnes",
    prix: 58,
    temps_forts: [
      "Coteaux et château d'Acquigny",
      "Moulins de la vallée",
      "Eau plate, accessible dès 8 ans",
    ],
    programme: [
      { time: "09h30", title: "Accueil à Acquigny", detail: "Prise en main de la pagaie sur berge." },
      { time: "10h00", title: "Coteaux de l'Eure", detail: "6 km de marche, 120 m de dénivelé." },
      { time: "12h30", title: "Déjeuner au moulin", detail: "Pause à l'ombre." },
      { time: "14h00", title: "Descente de l'Eure", detail: "8 km d'eau plate, courant faible, un seul portage facultatif." },
      { time: "16h30", title: "Arrivée", detail: "Fin de journée." },
    ],
    inclus: ["Guide diplômé", "Canoë biplace ou triplace", "Navette", "Goûter"],
  },
  {
    slug: "gorges-de-la-souleuvre",
    spotId: "vire-souleuvre",
    title: "Les Gorges de la Souleuvre",
    tagline: "Deux jours, un bivouac, le bocage vu du fond des vallées",
    commune: "Vire Normandie",
    departement: "Calvados",
    intro:
      "Le seul itinéraire en deux jours. On remonte le bocage par les chemins creux jusqu'au viaduc de la Souleuvre, on bivouaque en hauteur, et le lendemain on descend la Vire en canoë jusqu'à Saint-Lô. C'est long, c'est autonome, et c'est la meilleure façon de comprendre pourquoi la Normandie intérieure ne ressemble à rien d'autre.",
    difficulty: 5,
    niveau: "Engagé",
    stats: { distanceKm: 47, randoKm: 24, canoeKm: 23, deniveleM: 980, dureeH: 16, jours: 2 },
    saison: "Mai → Septembre",
    groupe: "4 à 8 personnes",
    prix: 245,
    temps_forts: [
      "Chemins creux du bocage virois",
      "Bivouac sous le viaduc de la Souleuvre",
      "23 km de descente de la Vire",
    ],
    programme: [
      { time: "Jour 1 — 08h00", title: "Départ de Vire", detail: "24 km de marche, 980 m de dénivelé, portage du matériel de bivouac." },
      { time: "Jour 1 — 19h00", title: "Bivouac", detail: "Installation, repas chaud, nuit sous tente fournie." },
      { time: "Jour 2 — 07h30", title: "Mise à l'eau", detail: "Petit-déjeuner puis embarquement sur la Vire." },
      { time: "Jour 2 — 09h00", title: "Descente vers Saint-Lô", detail: "23 km, quatre écluses à portager, eau calme." },
      { time: "Jour 2 — 17h00", title: "Arrivée à Saint-Lô", detail: "Navette retour vers Vire." },
    ],
    inclus: ["Guide diplômé", "Tente, matelas et repas", "Canoë et bidons étanches", "Navette retour"],
  },
]

type Extra = {
  partnerSlug: string
  partnerName: string
  niveauConseille: string
  ageMin: number
  prixEnfant?: number
  tempsRandoH: number
  tempsCanoeH: number
  nonInclus: string[]
  equipement?: string[]
  pratique: PracticalInfo[]
  rendezVous: RendezVous
}

const EQUIPEMENT_COMMUN = [
  "Chaussures de randonnée tenant la cheville",
  "Tenue de rechange complète dans un sac",
  "Gourde d'un litre et demi minimum",
  "Protection solaire et casquette",
  "Coupe-vent imperméable",
]

const NON_INCLUS_COMMUN = ["Transport jusqu'au point de rendez-vous", "Assurance annulation"]

const EXTRAS: Record<string, Extra> = {
  "suisse-normande": {
    partnerSlug: "base-de-clecy",
    partnerName: "Base nautique de Clécy",
    niveauConseille:
      "Marcheur régulier, capable d'enchaîner 12 km avec du dénivelé. Aucune expérience de canoë nécessaire : l'Orne est calme et l'initiation se fait sur berge.",
    ageMin: 10,
    prixEnfant: 69,
    tempsRandoH: 3.5,
    tempsCanoeH: 2.5,
    nonInclus: [...NON_INCLUS_COMMUN, "Déjeuner (panier possible sur demande, 14 €)"],
    pratique: [
      { label: "Parking", detail: "Gratuit au bourg de Clécy, à 200 m du point de rendez-vous." },
      { label: "Repas", detail: "Pique-nique à prévoir, ou panier normand à commander à la réservation." },
      { label: "Météo", detail: "La sortie est maintenue sous la pluie, annulée en cas d'orage ou de crue. Décision la veille à 18 h." },
      { label: "Navette", detail: "Un minibus ramène le groupe au point de départ en fin de journée." },
    ],
    rendezVous: { lieu: "Base nautique de Clécy", adresse: "Le Vey, 14570 Clécy", lat: 48.9145, lng: -0.4789, heure: "08h30" },
  },
  "roche-d-oetre": {
    partnerSlug: "base-de-clecy",
    partnerName: "Base nautique de Clécy",
    niveauConseille:
      "Sportif habitué à la marche en terrain accidenté et sans vertige : deux passages câblés sur le sentier des Corniches. Canoë accessible après briefing.",
    ageMin: 14,
    tempsRandoH: 4.5,
    tempsCanoeH: 3,
    nonInclus: [...NON_INCLUS_COMMUN, "Déjeuner"],
    pratique: [
      { label: "Parking", detail: "Parking de la Roche d'Oëtre, gratuit." },
      { label: "Repas", detail: "Pique-nique à prévoir. Un encas est fourni à mi-parcours." },
      { label: "Météo", detail: "Sortie annulée si la Rouvre dépasse 40 cm à l'échelle de Pont-d'Ouilly." },
    ],
    rendezVous: { lieu: "Parking de la Roche d'Oëtre", adresse: "Saint-Philbert-sur-Orne, 61430", lat: 48.8325, lng: -0.4367, heure: "08h00" },
  },
  "boucle-de-la-seine": {
    partnerSlug: "seine-canoe-andelys",
    partnerName: "Seine Canoë — Les Andelys",
    niveauConseille:
      "Tout public en bonne forme. La montée à Château Gaillard est courte, la Seine est plate. Bon premier parcours en famille.",
    ageMin: 8,
    prixEnfant: 55,
    tempsRandoH: 2.5,
    tempsCanoeH: 2.5,
    nonInclus: [...NON_INCLUS_COMMUN, "Déjeuner", "Entrée du château (facultative, 4 €)"],
    pratique: [
      { label: "Parking", detail: "Parking du Petit Andely, le long de la Seine." },
      { label: "Repas", detail: "Pique-nique à prévoir ; boulangerie et épicerie au Petit Andely." },
      { label: "Navigation", detail: "La Seine est un fleuve navigué : on reste en rive, le guide signale les péniches." },
    ],
    rendezVous: { lieu: "Embarcadère du Petit Andely", adresse: "Quai Sadi Carnot, 27700 Les Andelys", lat: 49.2414, lng: 1.4083, heure: "09h00" },
  },
  "cote-d-albatre": {
    partnerSlug: "kayak-cote-albatre",
    partnerName: "Kayak Côte d'Albâtre",
    niveauConseille:
      "Sportif, à l'aise dans l'eau et capable de nager 50 m. Le kayak de mer demande un briefing complet, assuré par un guide diplômé mer.",
    ageMin: 16,
    tempsRandoH: 4,
    tempsCanoeH: 3,
    nonInclus: [...NON_INCLUS_COMMUN, "Déjeuner"],
    equipement: [...EQUIPEMENT_COMMUN, "Maillot de bain et serviette", "Chaussures fermées acceptant l'eau"],
    pratique: [
      { label: "Marée", detail: "L'horaire exact dépend de la marée et vous est confirmé 48 h avant." },
      { label: "Parking", detail: "Parking payant d'Étretat ; parking gratuit à 15 minutes à pied." },
      { label: "Météo", detail: "Sortie annulée au-delà de force 4 ou si la houle dépasse 1 m. Remboursement intégral." },
    ],
    rendezVous: { lieu: "Plage d'Étretat, poste de secours", adresse: "Promenade de la plage, 76790 Étretat", lat: 49.7072, lng: 0.2017, heure: "08h30" },
  },
  "baie-du-mont": {
    partnerSlug: "canoe-couesnon",
    partnerName: "Canoë du Couesnon",
    niveauConseille:
      "Tout public capable de marcher 13 km sur sable, pieds nus ou en chaussons néoprène. Le canoë remonte avec le flot : aucun effort technique.",
    ageMin: 8,
    prixEnfant: 68,
    tempsRandoH: 3.5,
    tempsCanoeH: 2,
    nonInclus: [...NON_INCLUS_COMMUN, "Déjeuner"],
    equipement: ["Short ou pantalon retroussable", "Chaussons néoprène ou vieilles baskets", "Coupe-vent", "Gourde et pique-nique", "Protection solaire"],
    pratique: [
      { label: "Horaires", detail: "Ils dépendent du coefficient de marée et sont communiqués la veille à 18 h." },
      { label: "Parking", detail: "Parking du Bec d'Andaine, gratuit." },
      { label: "Sécurité", detail: "La traversée se fait uniquement avec un guide de baie agréé. Aucun écart au groupe n'est toléré." },
    ],
    rendezVous: { lieu: "Bec d'Andaine", adresse: "Route du Bec d'Andaine, 50530 Genêts", lat: 48.6797, lng: -1.5119, heure: "Selon marée" },
  },
  "vallee-de-l-eure": {
    partnerSlug: "seine-canoe-andelys",
    partnerName: "Seine Canoë — Les Andelys",
    niveauConseille:
      "Le parcours d'initiation : accessible dès 8 ans, sans aucune expérience. Idéal pour une première sortie en famille.",
    ageMin: 8,
    prixEnfant: 42,
    tempsRandoH: 2,
    tempsCanoeH: 2.5,
    nonInclus: [...NON_INCLUS_COMMUN, "Déjeuner"],
    pratique: [
      { label: "Parking", detail: "Parking du château d'Acquigny, gratuit." },
      { label: "Repas", detail: "Pique-nique à prévoir ; un goûter est offert à l'arrivée." },
      { label: "Enfants", detail: "Les enfants embarquent avec un adulte en canoë triplace." },
    ],
    rendezVous: { lieu: "Parking du château", adresse: "1 rue Aristide Briand, 27400 Acquigny", lat: 49.1736, lng: 1.1772, heure: "09h30" },
  },
  "gorges-de-la-souleuvre": {
    partnerSlug: "base-de-clecy",
    partnerName: "Base nautique de Clécy",
    niveauConseille:
      "Randonneur confirmé, habitué à porter un sac de 8 kg sur une journée entière. Nuit sous tente. Expérience de canoë souhaitée.",
    ageMin: 16,
    tempsRandoH: 7,
    tempsCanoeH: 6,
    nonInclus: [...NON_INCLUS_COMMUN, "Déjeuners des deux jours", "Sac de couchage (location possible, 8 €)"],
    equipement: [...EQUIPEMENT_COMMUN, "Sac à dos de 30 à 40 litres", "Sac de couchage", "Lampe frontale", "Deux pique-niques"],
    pratique: [
      { label: "Parking", detail: "Parking de la gare de Vire, gratuit ; la navette vous y ramène le deuxième jour." },
      { label: "Bivouac", detail: "Tente, matelas et repas chaud du soir fournis. Pas de douche." },
      { label: "Météo", detail: "Sortie reportée si une alerte orange est annoncée sur l'un des deux jours." },
    ],
    rendezVous: { lieu: "Gare de Vire", adresse: "Place de la Gare, 14500 Vire Normandie", lat: 48.8389, lng: -0.8889, heure: "08h00" },
  },
}

const COMMON = {
  regionCode: "28",
  regionSlug: "normandie",
  regionName: "Normandie",
  ageEnfantMax: 12,
  placesParDefaut: 12,
  minParticipants: 1,
  maxParticipants: 8,
  gallery: [] as Adventure["gallery"],
}

export const ADVENTURES: Adventure[] = BASE.map((base) => {
  const extra = EXTRAS[base.slug]
  const { tempsRandoH, tempsCanoeH, ...rest } = extra
  return {
    ...base,
    ...COMMON,
    ...rest,
    equipement: extra.equipement ?? EQUIPEMENT_COMMUN,
    stats: { ...base.stats, tempsRandoH, tempsCanoeH },
  }
})
