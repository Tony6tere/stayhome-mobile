/**
 * Données de démonstration StayHome.
 * Toutes les URLs d'images ont été vérifiées (HTTP 200) et chaque photo
 * a été visuellement associée au type de logement qu'elle illustre.
 */
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

/** Nom d'icône réellement présent dans la police : une faute est bloquée à la compilation. */
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type ListingType = 'appartement' | 'hotel' | 'chambre' | 'villa' | 'studio' | 'maison';

export type AmenityKey =
  | 'wifi'
  | 'cuisine'
  | 'clim'
  | 'parking'
  | 'tv'
  | 'lave-linge'
  | 'piscine'
  | 'petit-dejeuner'
  | 'securite'
  | 'groupe-electrogene'
  | 'vue-mer'
  | 'salle-de-sport';

export type Review = {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  comment: string;
};

export type Host = {
  id: string;
  name: string;
  avatar: string;
  since: string;
  superhost: boolean;
  responseRate: number;
};

export type Listing = {
  id: string;
  title: string;
  type: ListingType;
  city: string;
  area: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  hostId: string;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: AmenityKey[];
  description: string;
  instantBook: boolean;
  featured: boolean;
  reviews: Review[];
};

/** Construit une URL Unsplash à la largeur demandée (évite de télécharger du 4K sur mobile). */
export const photo = (id: string, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const AVATARS = {
  tony: photo('1507003211169-0a1dd7228f2d', 200),
  awa: photo('1544005313-94ddf0286df2', 200),
  marc: photo('1472099645785-5658abf4ff4e', 200),
  paul: photo('1500648767791-00dcc994a43e', 200),
  sandrine: photo('1494790108377-be9c29b29330', 200),
  linda: photo('1517841905240-472988babdf9', 200),
  rachel: photo('1534528741775-53994a69daeb', 200),
  claire: photo('1438761681033-6461ffad8d80', 200),
};

export const CURRENT_USER_AVATAR = AVATARS.tony;

export const HOSTS: Record<string, Host> = {
  h1: { id: 'h1', name: 'Marc Etoa', avatar: AVATARS.marc, since: '2021', superhost: true, responseRate: 98 },
  h2: { id: 'h2', name: 'Awa Ngo Bell', avatar: AVATARS.awa, since: '2020', superhost: true, responseRate: 100 },
  h3: { id: 'h3', name: 'Paul Mbarga', avatar: AVATARS.paul, since: '2022', superhost: false, responseRate: 92 },
  h4: { id: 'h4', name: 'Sandrine Kamdem', avatar: AVATARS.sandrine, since: '2019', superhost: true, responseRate: 97 },
  h5: { id: 'h5', name: 'Linda Ateba', avatar: AVATARS.linda, since: '2023', superhost: false, responseRate: 88 },
  h6: { id: 'h6', name: 'Rachel Njoya', avatar: AVATARS.rachel, since: '2021', superhost: true, responseRate: 99 },
  h7: { id: 'h7', name: 'Claire Bikoï', avatar: AVATARS.claire, since: '2022', superhost: false, responseRate: 90 },
};

export const AMENITIES: Record<AmenityKey, { label: string; icon: IconName }> = {
  wifi: { label: 'Wi-Fi', icon: 'wifi' },
  cuisine: { label: 'Cuisine équipée', icon: 'silverware-fork-knife' },
  clim: { label: 'Climatisation', icon: 'air-conditioner' },
  parking: { label: 'Parking', icon: 'car' },
  tv: { label: 'Télévision', icon: 'television' },
  'lave-linge': { label: 'Machine à laver', icon: 'washing-machine' },
  piscine: { label: 'Piscine', icon: 'pool' },
  'petit-dejeuner': { label: 'Petit-déjeuner', icon: 'coffee-outline' },
  securite: { label: 'Sécurité 24h/24', icon: 'shield-check-outline' },
  'groupe-electrogene': { label: 'Groupe électrogène', icon: 'power-plug-outline' },
  'vue-mer': { label: 'Vue sur la mer', icon: 'waves' },
  'salle-de-sport': { label: 'Salle de sport', icon: 'dumbbell' },
};

export const TYPE_LABELS: Record<ListingType, string> = {
  appartement: 'Appartement',
  hotel: 'Hôtel',
  chambre: 'Chambre',
  villa: 'Villa',
  studio: 'Studio',
  maison: 'Maison',
};

const AUTHOR_NAMES: Record<keyof typeof AVATARS, string> = {
  tony: 'Tony Tere',
  awa: 'Awa N.',
  marc: 'Marc E.',
  paul: 'Paul M.',
  sandrine: 'Sandrine K.',
  linda: 'Linda A.',
  rachel: 'Rachel N.',
  claire: 'Claire B.',
};

const r = (
  id: string,
  author: keyof typeof AVATARS,
  date: string,
  rating: number,
  comment: string
): Review => ({
  id,
  author: AUTHOR_NAMES[author],
  avatar: AVATARS[author],
  date,
  rating,
  comment,
});

export const LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Appartement moderne à Bonapriso',
    type: 'appartement',
    city: 'Douala',
    area: 'Bonapriso',
    price: 45,
    rating: 4.8,
    reviewCount: 124,
    images: [
      photo('1600607687939-ce8a6c25118c'),
      photo('1560448204-e02f11c3d0e2'),
      photo('1522771739844-6a9f6d5f14af'),
      photo('1600607686527-6fb886090705'),
      photo('1560448075-bb485b067938'),
    ],
    hostId: 'h1',
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    amenities: ['wifi', 'cuisine', 'clim', 'parking', 'tv', 'lave-linge', 'securite'],
    description:
      "Bel appartement moderne et confortable, idéal pour un séjour en famille ou entre amis. Situé dans un quartier calme et sécurisé de Bonapriso, proche des commerces, des restaurants et des transports. Lumineux toute la journée, il dispose d'un grand salon ouvert sur une terrasse et de deux chambres climatisées.",
    instantBook: true,
    featured: true,
    reviews: [
      r('r1', 'sandrine', 'Août 2025', 5, "Appartement impeccable et très bien situé. Marc est un hôte attentionné, tout était prêt à notre arrivée."),
      r('r2', 'paul', 'Juillet 2025', 5, 'Très bon rapport qualité-prix. Le quartier est calme et sécurisé, je recommande vivement.'),
      r('r3', 'linda', 'Juin 2025', 4, "Séjour agréable. La climatisation est efficace, seul petit bémol : le Wi-Fi un peu lent le soir."),
    ],
  },
  {
    id: 'l2',
    title: 'Hôtel Le Prestige — Chambre Deluxe',
    type: 'hotel',
    city: 'Douala',
    area: 'Bonanjo',
    price: 70,
    rating: 4.6,
    reviewCount: 89,
    images: [
      photo('1590381105924-c72589b9ef3f'),
      photo('1590490360182-c33d57733427'),
      photo('1566665797739-1674de7a421a'),
      photo('1600566752355-35792bedcfea'),
      photo('1551882547-ff40c63fe5fa'),
    ],
    hostId: 'h2',
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'clim', 'tv', 'parking', 'petit-dejeuner', 'piscine', 'salle-de-sport', 'securite'],
    description:
      "Chambre Deluxe au cœur du quartier des affaires de Bonanjo. Literie haut de gamme, salle de bain en marbre et service en chambre 24h/24. L'hôtel dispose d'une piscine extérieure, d'une salle de sport et d'un restaurant gastronomique.",
    instantBook: true,
    featured: true,
    reviews: [
      r('r4', 'marc', 'Septembre 2025', 5, 'Service irréprochable et petit-déjeuner copieux. Parfait pour un déplacement professionnel.'),
      r('r5', 'rachel', 'Août 2025', 4, "Chambre spacieuse et propre. La piscine est un vrai plus après une journée de travail."),
    ],
  },
  {
    id: 'l3',
    title: 'Chambre confortable chez Awa',
    type: 'chambre',
    city: 'Yaoundé',
    area: 'Bastos',
    price: 35,
    rating: 4.5,
    reviewCount: 67,
    images: [
      photo('1615874959474-d609969a20ed'),
      photo('1617103996702-96ff29b1c467'),
      photo('1600607687920-4e2a09cf159d'),
      photo('1616486338812-3dadae4b4ace'),
    ],
    hostId: 'h2',
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'clim', 'cuisine', 'tv', 'securite'],
    description:
      "Chambre privée chaleureuse dans une maison familiale de Bastos, le quartier diplomatique de Yaoundé. Vous avez accès à la cuisine, au salon et à la cour. Awa vous accueille avec le sourire et connaît la ville sur le bout des doigts.",
    instantBook: false,
    featured: false,
    reviews: [
      r('r6', 'claire', 'Juillet 2025', 5, "Awa est une hôtesse formidable, elle m'a fait découvrir les meilleurs maquis du quartier."),
      r('r7', 'tony', 'Mai 2025', 4, 'Chambre propre et calme, bon emplacement pour visiter Yaoundé.'),
    ],
  },
  {
    id: 'l4',
    title: 'Villa Palmier avec piscine privée',
    type: 'villa',
    city: 'Kribi',
    area: 'Mboa-Manga',
    price: 180,
    rating: 4.9,
    reviewCount: 54,
    images: [
      photo('1613977257363-707ba9348227'),
      photo('1600596542815-ffad4c1539a9'),
      photo('1583847268964-b28dc8f51f92'),
      photo('1598928636135-d146006ff4be'),
      photo('1600566752355-35792bedcfea'),
    ],
    hostId: 'h4',
    guests: 8,
    bedrooms: 4,
    beds: 5,
    baths: 3,
    amenities: ['wifi', 'cuisine', 'clim', 'parking', 'piscine', 'vue-mer', 'lave-linge', 'securite', 'groupe-electrogene'],
    description:
      "Villa d'exception à quelques minutes de la plage de Kribi. Quatre chambres climatisées, une grande piscine privée entourée de palmiers et une terrasse parfaite pour les couchers de soleil. Idéale pour des vacances en famille ou entre amis.",
    instantBook: false,
    featured: true,
    reviews: [
      r('r8', 'awa', 'Août 2025', 5, "Un vrai coin de paradis. La piscine et le jardin sont magnifiques, les enfants ont adoré."),
      r('r9', 'marc', 'Août 2025', 5, 'Villa spacieuse et très bien entretenue. Sandrine est disponible et réactive.'),
      r('r10', 'paul', 'Juillet 2025', 5, 'Rien à redire, on reviendra sans hésiter.'),
    ],
  },
  {
    id: 'l5',
    title: 'Studio cosy au centre d’Akwa',
    type: 'studio',
    city: 'Douala',
    area: 'Akwa',
    price: 28,
    rating: 4.4,
    reviewCount: 212,
    images: [
      photo('1519710164239-da123dc03ef4'),
      photo('1512918728675-ed5a9ecdebfd'),
      photo('1502005097973-6a7082348e28'),
      photo('1560440021-33f9b867899d'),
    ],
    hostId: 'h3',
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'cuisine', 'clim', 'tv', 'securite'],
    description:
      "Studio fonctionnel en plein centre d'Akwa, à deux pas des banques, des restaurants et de la vie nocturne. Parfait pour un court séjour professionnel ou pour un voyageur solo. Tout est à portée de marche.",
    instantBook: true,
    featured: false,
    reviews: [
      r('r11', 'linda', 'Septembre 2025', 4, 'Petit mais très bien pensé. Emplacement imbattable pour bouger dans Douala.'),
      r('r12', 'rachel', 'Août 2025', 5, "Check-in facile, studio propre. Exactement comme sur les photos."),
    ],
  },
  {
    id: 'l6',
    title: 'Appartement vue mer à Limbe',
    type: 'appartement',
    city: 'Limbe',
    area: 'Down Beach',
    price: 60,
    rating: 4.7,
    reviewCount: 98,
    images: [
      photo('1554995207-c18c203602cb'),
      photo('1560448205-4d9b3e6bb6db'),
      photo('1596394516093-501ba68a0ba6'),
      photo('1604014237800-1c9102c219da'),
    ],
    hostId: 'h5',
    guests: 4,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    amenities: ['wifi', 'cuisine', 'clim', 'vue-mer', 'parking', 'tv', 'groupe-electrogene'],
    description:
      "Réveillez-vous face à l'océan. Cet appartement lumineux surplombe la baie de Limbe et son sable volcanique. Grande terrasse, cuisine complète et deux chambres confortables. Les meilleurs poissons grillés sont à cinq minutes à pied.",
    instantBook: true,
    featured: true,
    reviews: [
      r('r13', 'sandrine', 'Août 2025', 5, 'La vue depuis la terrasse est incroyable, surtout au lever du soleil.'),
      r('r14', 'claire', 'Juin 2025', 4, "Très bel appartement. Prévoir une voiture pour visiter les alentours."),
    ],
  },
  {
    id: 'l7',
    title: 'Hôtel Mont Fébé — Suite Panorama',
    type: 'hotel',
    city: 'Yaoundé',
    area: 'Mont Fébé',
    price: 95,
    rating: 4.7,
    reviewCount: 312,
    images: [
      photo('1595576508898-0ad5c879a061'),
      photo('1594563703937-fdc640497dcd'),
      photo('1618773928121-c32242e63f39'),
      photo('1522798514-97ceb8c4f1c8'),
      photo('1590381105924-c72589b9ef3f'),
    ],
    hostId: 'h6',
    guests: 3,
    bedrooms: 1,
    beds: 2,
    baths: 1,
    amenities: ['wifi', 'clim', 'tv', 'parking', 'petit-dejeuner', 'piscine', 'salle-de-sport', 'securite', 'groupe-electrogene'],
    description:
      "Suite avec vue panoramique sur les collines de Yaoundé. Un classique de la capitale : jardins tropicaux, grande piscine, spa et restaurant panoramique. Le calme des hauteurs à dix minutes du centre.",
    instantBook: true,
    featured: false,
    reviews: [
      r('r15', 'paul', 'Septembre 2025', 5, 'La vue au petit matin vaut à elle seule le détour. Personnel très professionnel.'),
      r('r16', 'awa', 'Juillet 2025', 4, 'Bel établissement, un peu excentré mais le taxi est facile à trouver.'),
    ],
  },
  {
    id: 'l8',
    title: 'Maison familiale avec jardin',
    type: 'maison',
    city: 'Bafoussam',
    area: 'Djeleng',
    price: 75,
    rating: 4.6,
    reviewCount: 41,
    images: [
      photo('1600047509807-ba8f99d2cdde'),
      photo('1600210492486-724fe5c67fb0'),
      photo('1616594039964-ae9021a400a0'),
      photo('1600489000022-c2086d79f9d4'),
    ],
    hostId: 'h7',
    guests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 2,
    amenities: ['wifi', 'cuisine', 'parking', 'tv', 'lave-linge', 'securite', 'groupe-electrogene'],
    description:
      "Grande maison familiale avec jardin clôturé, dans un quartier résidentiel de Bafoussam. Trois chambres, un vaste séjour et une cuisine entièrement équipée. Point de départ idéal pour découvrir les chefferies de l'Ouest.",
    instantBook: false,
    featured: false,
    reviews: [
      r('r17', 'marc', 'Août 2025', 5, 'Maison très agréable, le jardin est parfait pour les enfants.'),
      r('r18', 'linda', 'Mai 2025', 4, 'Bon accueil de Claire et quartier tranquille.'),
    ],
  },
  {
    id: 'l9',
    title: 'Chambre calme chez Paul',
    type: 'chambre',
    city: 'Buea',
    area: 'Molyko',
    price: 25,
    rating: 4.3,
    reviewCount: 38,
    images: [
      photo('1631889993959-41b4e9c6e3c5'),
      photo('1618221195710-dd6b41faaea6'),
      photo('1600607687920-4e2a09cf159d'),
    ],
    hostId: 'h3',
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'cuisine', 'tv', 'parking'],
    description:
      "Chambre privée dans une maison au pied du Mont Cameroun. Quartier étudiant animé de Molyko, air frais garanti. Paul partage volontiers ses conseils de randonnée.",
    instantBook: true,
    featured: false,
    reviews: [
      r('r19', 'rachel', 'Juillet 2025', 4, "Simple et propre, exactement ce qu'il me fallait pour deux nuits."),
      r('r20', 'tony', 'Avril 2025', 5, 'Excellent accueil, et quel bonheur de se réveiller avec cette fraîcheur.'),
    ],
  },
  {
    id: 'l10',
    title: 'Loft design à Bonapriso',
    type: 'appartement',
    city: 'Douala',
    area: 'Bonapriso',
    price: 85,
    rating: 4.8,
    reviewCount: 76,
    images: [
      photo('1497366811353-6870744d04b2'),
      photo('1600566753086-00f18fb6b3ea'),
      photo('1587985064135-0366536eab42'),
      photo('1600489000022-c2086d79f9d4'),
    ],
    hostId: 'h1',
    guests: 3,
    bedrooms: 1,
    beds: 2,
    baths: 1,
    amenities: ['wifi', 'cuisine', 'clim', 'parking', 'tv', 'lave-linge', 'securite', 'salle-de-sport'],
    description:
      "Loft d'architecte aux volumes généreux et aux grandes baies vitrées. Mobilier design, cuisine ouverte haut de gamme et mezzanine nuit. Une adresse rare à Douala pour les amateurs de beaux espaces.",
    instantBook: true,
    featured: true,
    reviews: [
      r('r21', 'claire', 'Septembre 2025', 5, "Le loft est encore plus beau en vrai. Décoration soignée jusqu'au moindre détail."),
      r('r22', 'sandrine', 'Août 2025', 5, 'Parfait pour un séjour en amoureux. Très lumineux.'),
    ],
  },
  {
    id: 'l11',
    title: 'Villa Océan — front de mer',
    type: 'villa',
    city: 'Limbe',
    area: 'Mile 6',
    price: 210,
    rating: 5.0,
    reviewCount: 29,
    images: [
      photo('1600573472550-8090b5e0745e'),
      photo('1571896349842-33c89424de2d'),
      photo('1598928506311-c55ded91a20c'),
      photo('1582719478250-c89cae4dc85b'),
    ],
    hostId: 'h4',
    guests: 10,
    bedrooms: 5,
    beds: 6,
    baths: 4,
    amenities: ['wifi', 'cuisine', 'clim', 'parking', 'piscine', 'vue-mer', 'lave-linge', 'securite', 'groupe-electrogene', 'salle-de-sport'],
    description:
      "Villa contemporaine les pieds dans l'eau, avec piscine à débordement face à l'Atlantique. Cinq suites, salon cathédrale et cuisine de chef. Le grand luxe pour les grandes occasions.",
    instantBook: false,
    featured: true,
    reviews: [
      r('r23', 'marc', 'Août 2025', 5, "Nous avons fêté un anniversaire ici, c'était magique. Service impeccable."),
      r('r24', 'awa', 'Juin 2025', 5, 'La plus belle villa dans laquelle nous ayons séjourné au Cameroun.'),
    ],
  },
  {
    id: 'l12',
    title: 'Appartement Bastos Résidence',
    type: 'appartement',
    city: 'Yaoundé',
    area: 'Bastos',
    price: 55,
    rating: 4.5,
    reviewCount: 143,
    images: [
      photo('1524758631624-e2822e304c36'),
      photo('1522708323590-d24dbb6b0267'),
      photo('1505693416388-ac5ce068fe85'),
      photo('1556912173-3bb406ef7e77'),
    ],
    hostId: 'h6',
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    amenities: ['wifi', 'cuisine', 'clim', 'parking', 'tv', 'lave-linge', 'securite', 'groupe-electrogene'],
    description:
      "Appartement confortable dans une résidence sécurisée de Bastos, avec gardiennage 24h/24 et groupe électrogène. Deux chambres, deux salles de bain, et un salon accueillant pour se retrouver en fin de journée.",
    instantBook: true,
    featured: false,
    reviews: [
      r('r25', 'paul', 'Septembre 2025', 5, 'Résidence sûre et bien tenue, parfait avec des enfants.'),
      r('r26', 'linda', 'Août 2025', 4, "Bon appartement, conforme à l'annonce. Rachel répond très vite."),
    ],
  },
  {
    id: 'l13',
    title: 'Kribi Beach Resort — Bungalow',
    type: 'hotel',
    city: 'Kribi',
    area: 'Grand Batanga',
    price: 120,
    rating: 4.8,
    reviewCount: 187,
    images: [
      photo('1571003123894-1f0594d2b5d9'),
      photo('1516815231560-8f41ec531527'),
      photo('1584132967334-10e028bd69f7'),
      photo('1595526114035-0d45ed16cfbf'),
    ],
    hostId: 'h4',
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    amenities: ['wifi', 'clim', 'piscine', 'vue-mer', 'petit-dejeuner', 'parking', 'securite', 'tv'],
    description:
      "Bungalow les pieds dans le sable, face à l'océan. Le resort propose une piscine, un restaurant de fruits de mer et un accès direct à la plage. Les chutes de la Lobé sont à quinze minutes.",
    instantBook: true,
    featured: true,
    reviews: [
      r('r27', 'rachel', 'Août 2025', 5, "S'endormir avec le bruit des vagues, il n'y a rien de mieux."),
      r('r28', 'claire', 'Juillet 2025', 5, 'Bungalow charmant et personnel très accueillant. Le poisson braisé est délicieux.'),
    ],
  },
  {
    id: 'l14',
    title: 'Studio étudiant Ngoa-Ekellé',
    type: 'studio',
    city: 'Yaoundé',
    area: 'Ngoa-Ekellé',
    price: 20,
    rating: 4.2,
    reviewCount: 95,
    images: [
      photo('1536376072261-38c75010e6c9'),
      photo('1560185893-a55cbc8c57e8'),
      photo('1502672023488-70e25813eb80'),
      photo('1502005097973-6a7082348e28'),
    ],
    hostId: 'h5',
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'cuisine', 'tv', 'securite'],
    description:
      "Studio simple et bien situé à Ngoa-Ekellé, à côté de l'université de Yaoundé I. Idéal pour un étudiant ou un séjour longue durée à petit budget. Coin cuisine, bureau et connexion fibre.",
    instantBook: true,
    featured: false,
    reviews: [
      r('r29', 'tony', 'Juin 2025', 4, "Rapport qualité-prix imbattable dans le quartier."),
      r('r30', 'marc', 'Mars 2025', 4, 'Petit studio propre, la fibre fonctionne bien pour télétravailler.'),
    ],
  },
  {
    id: 'l15',
    title: 'Appartement Akwa Premium',
    type: 'appartement',
    city: 'Douala',
    area: 'Akwa',
    price: 50,
    rating: 4.6,
    reviewCount: 64,
    images: [
      photo('1615529182904-14819c35db37'),
      photo('1631679706909-1844bbd07221'),
      photo('1631049307264-da0ec9d70304'),
      photo('1560448075-bb485b067938'),
    ],
    hostId: 'h7',
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    amenities: ['wifi', 'cuisine', 'clim', 'tv', 'lave-linge', 'parking', 'securite'],
    description:
      "Appartement chaleureux à la décoration soignée, mêlant matières naturelles et artisanat local. Situé à Akwa, il vous met à quelques minutes du port, des marchés et du boulevard de la Liberté.",
    instantBook: true,
    featured: false,
    reviews: [
      r('r31', 'awa', 'Septembre 2025', 5, 'Décoration magnifique et très bon lit. Je recommande.'),
      r('r32', 'sandrine', 'Juillet 2025', 4, 'Bien situé, calme malgré le quartier animé.'),
    ],
  },
  {
    id: 'l16',
    title: 'Chambre vue montagne à Buea',
    type: 'chambre',
    city: 'Buea',
    area: 'Bokwango',
    price: 30,
    rating: 4.6,
    reviewCount: 52,
    images: [
      photo('1540518614846-7eded433c457'),
      photo('1596394516093-501ba68a0ba6'),
      photo('1616486338812-3dadae4b4ace'),
    ],
    hostId: 'h5',
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'cuisine', 'tv', 'parking', 'petit-dejeuner'],
    description:
      "Chambre douillette avec vue dégagée sur le Mont Cameroun. Le petit-déjeuner local est offert, et Linda organise des départs de randonnée dès l'aube pour ceux qui veulent tenter l'ascension.",
    instantBook: false,
    featured: false,
    reviews: [
      r('r33', 'paul', 'Août 2025', 5, "Le réveil face à la montagne est un souvenir inoubliable."),
      r('r34', 'rachel', 'Juin 2025', 4, 'Accueil très chaleureux et petit-déjeuner copieux.'),
    ],
  },
];

export const DESTINATIONS = [
  { id: 'd1', city: 'Douala', label: 'La capitale économique', image: photo('1580060839134-75a5edca2e99', 600) },
  { id: 'd2', city: 'Yaoundé', label: 'La ville aux sept collines', image: photo('1580216643062-cf460548a66a', 600) },
  { id: 'd3', city: 'Kribi', label: 'Plages et chutes de la Lobé', image: photo('1516815231560-8f41ec531527', 600) },
  { id: 'd4', city: 'Limbe', label: 'Sable noir et océan', image: photo('1571003123894-1f0594d2b5d9', 600) },
  { id: 'd5', city: 'Buea', label: 'Au pied du Mont Cameroun', image: photo('1568454537842-d933259bb258', 600) },
  { id: 'd6', city: 'Bafoussam', label: "Les hauteurs de l'Ouest", image: photo('1584132967334-10e028bd69f7', 600) },
];

export const CITIES = ['Douala', 'Yaoundé', 'Kribi', 'Limbe', 'Buea', 'Bafoussam'];

export const getListing = (id: string | undefined) => LISTINGS.find((l) => l.id === id);
export const getHost = (id: string) => HOSTS[id];
