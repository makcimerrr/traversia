import { ADVENTURES } from "./adventures"
import type { Faq, Page, Partner, Post, Region, Review, SiteSettings, Slot } from "./types"

/**
 * Contenu de démonstration des entités autres que les aventures.
 * Même forme que ce que renvoie Payload — voir src/lib/content.ts.
 */

export const REGIONS_DEMO: Region[] = [
  {
    slug: "normandie",
    code: "28",
    name: "Normandie",
    description:
      "Le bocage, les vallées de l'Orne et de la Seine, la côte d'Albâtre et la baie du Mont : sept parcours entre crêtes et rivières.",
    active: true,
  },
  {
    slug: "bretagne",
    code: "53",
    name: "Bretagne",
    description: "Ouverture prévue en 2027.",
    active: false,
  },
]

export const PARTNERS_DEMO: Partner[] = [
  {
    slug: "base-de-clecy",
    name: "Base nautique de Clécy",
    tagline: "La base historique de la Suisse Normande, sur l'Orne depuis 1978.",
    description:
      "Installée au Vey, au pied des Rochers des Parcs, la base fournit canoës, gilets et navettes pour les parcours de l'Orne et de la Vire. Quatre moniteurs diplômés d'État.",
    commune: "Clécy",
    departement: "Calvados",
    adresse: "Le Vey, 14570 Clécy",
    website: "https://example.com",
    telephone: "+33 2 31 00 00 01",
    regionSlugs: ["normandie"],
    active: true,
  },
  {
    slug: "seine-canoe-andelys",
    name: "Seine Canoë — Les Andelys",
    tagline: "Descentes de la Seine et de l'Eure, au pied de Château Gaillard.",
    description:
      "Base nautique du Petit Andely, spécialisée dans la navigation sur fleuve et sur l'Eure. Canoës biplaces et triplaces, encadrement adapté aux familles.",
    commune: "Les Andelys",
    departement: "Eure",
    adresse: "Quai Sadi Carnot, 27700 Les Andelys",
    telephone: "+33 2 32 00 00 02",
    regionSlugs: ["normandie"],
    active: true,
  },
  {
    slug: "kayak-cote-albatre",
    name: "Kayak Côte d'Albâtre",
    tagline: "Kayak de mer sous les falaises d'Étretat.",
    description:
      "Club de kayak de mer labellisé, guides diplômés mer. Sorties conditionnées à la météo marine, matériel de sécurité complet.",
    commune: "Étretat",
    departement: "Seine-Maritime",
    adresse: "Promenade de la plage, 76790 Étretat",
    regionSlugs: ["normandie"],
    active: true,
  },
  {
    slug: "canoe-couesnon",
    name: "Canoë du Couesnon",
    tagline: "Remontées du Couesnon avec le flot, face au Mont.",
    description:
      "Petite structure familiale installée à Genêts, qui travaille avec les guides de baie agréés pour les traversées.",
    commune: "Genêts",
    departement: "Manche",
    adresse: "Route du Bec d'Andaine, 50530 Genêts",
    regionSlugs: ["normandie"],
    active: true,
  },
]

/** AAAA-MM-JJ dans le fuseau de Paris, quelle que soit la machine. */
export function toDateKey(date: Date): string {
  return date.toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" })
}

/**
 * Génère des créneaux de démonstration : un samedi sur deux pendant six
 * mois, à partir du prochain samedi, pour chaque aventure. Quelques dates
 * sont volontairement presque pleines ou complètes.
 */
export function slotsDemo(from: Date = new Date()): Slot[] {
  const start = new Date(from)
  start.setHours(12, 0, 0, 0)
  start.setDate(start.getDate() + ((6 - start.getDay() + 7) % 7 || 7))

  const slots: Slot[] = []
  ADVENTURES.forEach((adventure, ai) => {
    for (let i = 0; i < 13; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i * 14 + (ai % 2) * 7)
      const places = adventure.placesParDefaut
      const pattern = (i + ai) % 5
      const placesReservees = pattern === 0 ? places : pattern === 1 ? places - 2 : (pattern * 2) % places
      const statut: Slot["statut"] = placesReservees >= places ? "complet" : "ouvert"
      slots.push({
        id: `demo-${adventure.slug}-${i}`,
        adventureSlug: adventure.slug,
        partnerSlug: adventure.partnerSlug ?? "",
        partnerName: adventure.partnerName ?? "",
        date: toDateKey(date),
        heure: adventure.rendezVous.heure,
        places,
        placesReservees,
        placesRestantes: Math.max(0, places - placesReservees),
        prix: adventure.prix,
        statut,
      })
    }
  })
  return slots.sort((a, b) => a.date.localeCompare(b.date))
}

export const FAQS_DEMO: Faq[] = [
  {
    id: "faq-1",
    question: "Faut-il savoir faire du canoë ?",
    reponse:
      "Non. Tous les parcours commencent par une initiation sur berge, et un guide ouvre la descente pendant qu'un second la ferme. Les parcours notés 4 et 5 demandent toutefois d'être à l'aise dans l'eau.",
    categorie: "securite",
    general: true,
    adventureSlugs: [],
  },
  {
    id: "faq-2",
    question: "À partir de quel âge ?",
    reponse:
      "Huit ans sur les parcours Découverte et Facile, accompagnés d'un adulte dans le même canoë. L'âge minimum est indiqué sur chaque fiche ; il monte à seize ans sur les parcours engagés.",
    categorie: "reservation",
    general: true,
    adventureSlugs: [],
  },
  {
    id: "faq-3",
    question: "Que se passe-t-il en cas de mauvais temps ?",
    reponse:
      "La pluie ne change rien. L'orage, la crue, le vent de mer ou une alerte météo entraînent un report ou un remboursement intégral, au choix. La décision appartient au guide et vous est communiquée la veille à 18 h.",
    categorie: "annulation",
    general: true,
    adventureSlugs: [],
  },
  {
    id: "faq-4",
    question: "Puis-je annuler ma réservation ?",
    reponse:
      "Gratuitement jusqu'à sept jours avant la date. Entre sept jours et la veille, un avoir valable un an vous est proposé. Le jour même, la réservation est due.",
    categorie: "annulation",
    general: true,
    adventureSlugs: [],
  },
  {
    id: "faq-5",
    question: "Que dois-je apporter ?",
    reponse:
      "Des chaussures de marche, une tenue de rechange, de l'eau et un pique-nique. Tout le matériel nautique est fourni : canoë, pagaie, gilet, bidon étanche. La liste exacte est sur chaque fiche et dans votre e-mail de confirmation.",
    categorie: "materiel",
    general: true,
    adventureSlugs: [],
  },
  {
    id: "faq-6",
    question: "Mes affaires restent-elles au sec ?",
    reponse:
      "Chaque canoë embarque un bidon étanche de 30 litres. Les sacs de randonnée voyagent dans la navette et vous attendent à l'arrivée.",
    categorie: "jour-j",
    general: true,
    adventureSlugs: [],
  },
  {
    id: "faq-7",
    question: "Comment se passe le retour au point de départ ?",
    reponse:
      "Tous les parcours sont fermés : une navette vous ramène à votre véhicule en fin de journée. Le temps de navette est compris dans la durée annoncée.",
    categorie: "jour-j",
    general: true,
    adventureSlugs: [],
  },
  {
    id: "faq-8",
    question: "Les horaires dépendent-ils de la marée ?",
    reponse:
      "Oui. L'heure de rendez-vous est fixée quatre heures avant la basse mer et vous est communiquée la veille à 18 h. Prévoyez une journée entière sur place.",
    categorie: "jour-j",
    general: false,
    adventureSlugs: ["baie-du-mont", "cote-d-albatre"],
  },
  {
    id: "faq-9",
    question: "Comment se passe la nuit en bivouac ?",
    reponse:
      "Tentes deux places, matelas et repas chaud fournis. Prévoyez votre sac de couchage, ou louez-en un à la réservation. Pas de douche, un point d'eau.",
    categorie: "materiel",
    general: false,
    adventureSlugs: ["gorges-de-la-souleuvre"],
  },
]

export const REVIEWS_DEMO: Review[] = [
  {
    id: "rev-1",
    auteur: "Marion L.",
    note: 5,
    texte:
      "La montée aux Rochers des Parcs vaut à elle seule la journée. Et redescendre l'Orne en voyant la crête qu'on vient de faire, c'est exactement la promesse.",
    date: "2026-06-14",
    adventureSlug: "suisse-normande",
  },
  {
    id: "rev-2",
    auteur: "Thomas B.",
    note: 4,
    texte:
      "Parcours exigeant, bien encadré. Les passages câblés impressionnent mais le guide prend le temps. Prévoir vraiment de bonnes chaussures.",
    date: "2026-07-05",
    adventureSlug: "roche-d-oetre",
  },
  {
    id: "rev-3",
    auteur: "Famille Hervieu",
    note: 5,
    texte:
      "Première sortie en canoë avec deux enfants de 9 et 11 ans. Tout était pensé pour eux, le goûter à l'arrivée a fini de les convaincre.",
    date: "2026-05-23",
    adventureSlug: "vallee-de-l-eure",
  },
  {
    id: "rev-4",
    auteur: "Claire D.",
    note: 5,
    texte:
      "La traversée de la baie pieds nus puis la remontée du Couesnon avec la marée, c'est une journée qu'on n'oublie pas. Organisation impeccable.",
    date: "2026-08-02",
    adventureSlug: "baie-du-mont",
  },
  {
    id: "rev-5",
    auteur: "Julien M.",
    note: 4,
    texte: "Deux jours intenses, bivouac sous le viaduc magique. La descente de la Vire est longue, prévoyez des bras.",
    date: "2026-06-28",
    adventureSlug: "gorges-de-la-souleuvre",
  },
]

export const SETTINGS_DEMO: SiteSettings = {
  email: "bonjour@traversia.fr",
  telephone: "+33 2 31 00 00 00",
  adresse: "12 rue du Vey\n14570 Clécy",
  horaires: "Avril → Octobre, 7j/7",
  raisonSociale: "Traversia SAS",
  formeJuridique: "Société par actions simplifiée",
  capital: "10 000 €",
  siret: "000 000 000 00000",
  tva: "FR00000000000",
  siegeSocial: "12 rue du Vey, 14570 Clécy",
  directeurPublication: "Camille Rouault",
  immatriculationTourisme: "IM000000000",
  assuranceRc: "À compléter",
  delaiAnnulationJours: 7,
  ouvertureTraceHeures: 3,
  messageAccueil: "Le calendrier 2027 ouvre en février. Les groupes sont limités à douze.",
}

/** Pages légales de démonstration, à relire par un juriste avant mise en ligne. */
export const PAGES_DEMO: Page[] = [
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    description: "Éditeur, hébergeur et conditions d'utilisation du site traversia.fr.",
    updatedAt: "2026-10-16",
    body: {
      kind: "paragraphs",
      blocks: [
        {
          heading: "Éditeur du site",
          paragraphs: [
            "Le site traversia.fr est édité par Traversia SAS, société par actions simplifiée au capital de 10 000 €, dont le siège social est situé 12 rue du Vey, 14570 Clécy, immatriculée au RCS de Caen.",
            "Directrice de la publication : Camille Rouault. Contact : bonjour@traversia.fr.",
          ],
        },
        {
          heading: "Hébergement",
          paragraphs: [
            "Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Les données sont stockées dans l'Union européenne.",
          ],
        },
        {
          heading: "Propriété intellectuelle",
          paragraphs: [
            "L'ensemble des contenus du site (textes, tracés, photographies, cartes) est protégé par le droit d'auteur. Toute reproduction sans autorisation écrite est interdite.",
          ],
        },
      ],
    },
  },
  {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    description: "Quelles données Traversia collecte, pourquoi, et comment exercer vos droits.",
    updatedAt: "2026-10-16",
    body: {
      kind: "paragraphs",
      blocks: [
        {
          heading: "Données collectées",
          paragraphs: [
            "Lors d'une réservation, nous collectons votre nom, votre adresse e-mail, votre numéro de téléphone et la composition de votre groupe. Ces données servent à organiser la sortie, à vous envoyer les informations pratiques et à établir la facture.",
            "Le paiement est traité par Stripe ; nous ne conservons aucune donnée bancaire.",
          ],
        },
        {
          heading: "Durée de conservation",
          paragraphs: [
            "Les données de réservation sont conservées trois ans après la sortie, durée légale pour les documents comptables. Les messages du formulaire de contact sont supprimés après un an.",
          ],
        },
        {
          heading: "Vos droits",
          paragraphs: [
            "Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à bonjour@traversia.fr. Vous pouvez également saisir la CNIL.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "Le site utilise des cookies de mesure d'audience uniquement avec votre consentement, que vous pouvez retirer à tout moment depuis le bandeau prévu à cet effet.",
          ],
        },
      ],
    },
  },
  {
    slug: "cgv",
    title: "Conditions générales de vente",
    description: "Réservation, paiement, annulation et remboursement des packs aventure Traversia.",
    updatedAt: "2026-10-16",
    body: {
      kind: "paragraphs",
      blocks: [
        {
          heading: "Objet",
          paragraphs: [
            "Les présentes conditions régissent la vente des prestations « pack aventure » proposées sur traversia.fr : itinéraires guidés associant randonnée et canoë, opérés avec des partenaires nautiques locaux.",
          ],
        },
        {
          heading: "Réservation et paiement",
          paragraphs: [
            "La réservation est ferme à réception du paiement intégral en ligne. Une confirmation est envoyée par e-mail avec la facture et les informations pratiques.",
          ],
        },
        {
          heading: "Annulation par le client",
          paragraphs: [
            "Annulation gratuite jusqu'à sept jours avant la date. Entre sept jours et la veille, un avoir valable douze mois est émis. Le jour même, la prestation est due.",
          ],
        },
        {
          heading: "Annulation par Traversia",
          paragraphs: [
            "En cas de conditions météorologiques ou hydrologiques dangereuses, la sortie est reportée ou remboursée intégralement, au choix du client. La décision appartient au guide.",
          ],
        },
        {
          heading: "Aptitude et sécurité",
          paragraphs: [
            "Chaque participant déclare savoir nager 25 mètres et ne présenter aucune contre-indication médicale. Les consignes du guide s'imposent à tous pendant la sortie.",
          ],
        },
      ],
    },
  },
]

export const POSTS_DEMO: Post[] = [
  {
    slug: "ouverture-calendrier-2027",
    title: "Le calendrier 2027 ouvre en février",
    excerpt:
      "Sept parcours, un samedi sur deux d'avril à octobre, et deux nouveautés en préparation sur la Vire. Voici comment nous construisons une saison.",
    publishedAt: "2026-10-01",
    tags: ["actualites"],
    adventureSlugs: [],
    body: {
      kind: "paragraphs",
      blocks: [
        {
          paragraphs: [
            "Chaque hiver, nous retraçons. Les sentiers bougent, les accès à l'eau aussi, et un parcours qui tenait en sept heures en juin peut en demander huit en octobre. Le calendrier 2027 sera publié le 1er février, avec les premières dates fin avril.",
            "Les groupes restent limités à douze personnes. Les créneaux des parcours engagés, la Roche d'Oëtre et les Gorges de la Souleuvre, sont ouverts à huit.",
          ],
        },
        {
          heading: "Ce qui change",
          paragraphs: [
            "La réservation se fait désormais entièrement en ligne, avec paiement sécurisé et confirmation immédiate. Les informations pratiques, la liste du matériel et la trace GPX arrivent par e-mail dans la foulée.",
          ],
        },
      ],
    },
  },
  {
    slug: "choisir-son-premier-parcours",
    title: "Choisir son premier pack aventure",
    excerpt:
      "Découverte, facile, soutenu, sportif, engagé : ce que recouvrent nos cinq niveaux, et comment choisir sans se tromper.",
    publishedAt: "2026-09-12",
    tags: ["conseils"],
    adventureSlugs: ["vallee-de-l-eure", "boucle-de-la-seine"],
    body: {
      kind: "paragraphs",
      blocks: [
        {
          paragraphs: [
            "La difficulté annoncée sur chaque fiche combine trois choses : le dénivelé de la randonnée, la technicité de la rivière et la durée totale. Un parcours Découverte se fait avec des enfants de huit ans ; un parcours Engagé demande une vraie habitude de l'effort long.",
          ],
        },
        {
          heading: "Pour une première fois",
          paragraphs: [
            "La Vallée de l'Eure et la Boucle des Andelys sont nos deux portes d'entrée : peu de dénivelé, eau plate, une journée complète sans jamais forcer. Si vous marchez régulièrement, la Suisse Normande est le bon cran au-dessus.",
          ],
        },
        {
          heading: "Ce qui compte vraiment",
          paragraphs: [
            "Pas l'expérience du canoë, que l'on apprend en vingt minutes sur berge, mais la capacité à marcher plusieurs heures avec un sac léger. En cas de doute, écrivez-nous : nous répondons honnêtement.",
          ],
        },
      ],
    },
  },
  {
    slug: "la-rouvre-en-octobre",
    title: "La Rouvre en octobre",
    excerpt: "Récit d'une reconnaissance d'automne dans les gorges, entre niveaux d'eau capricieux et lumière rasante.",
    publishedAt: "2026-08-20",
    tags: ["recits", "territoire"],
    adventureSlugs: ["roche-d-oetre"],
    body: {
      kind: "paragraphs",
      blocks: [
        {
          paragraphs: [
            "On part de Pont-d'Ouilly à huit heures, dans une brume qui tient jusqu'au belvédère. Le sentier des Corniches est humide, les passages câblés demandent de la lenteur. Au sommet, la vallée se découvre d'un coup, et l'on comprend pourquoi la Roche a ce nom.",
            "La descente de la Rouvre, l'après-midi, se mérite : l'eau est basse, deux seuils demandent un portage court. C'est aussi ce qui en fait une rivière différente à chaque saison.",
          ],
        },
      ],
    },
  },
]
