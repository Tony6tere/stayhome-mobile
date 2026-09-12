# StayHome — démo mobile

> Plus qu'un séjour, une expérience.

Application mobile de réservation de logements (appartements, hôtels, chambres, villas,
studios, maisons) au Cameroun. **Version démo entièrement hors ligne** : aucun backend,
aucune donnée envoyée sur un serveur.

Construite avec Expo SDK 57, React Native 0.86, expo-router 57 et TypeScript.

---

## Démarrer

```bash
git clone https://github.com/Tony6tere/stayhome-mobile.git
cd stayhome-mobile
npm install
npm start       # puis scanner le QR code avec Expo Go
```

Expo Go doit être en **SDK 57** (la version du Play Store / App Store l'est).

| Commande | Effet |
| --- | --- |
| `npm start` | Serveur de développement (QR code Expo Go) |
| `npm run android` | Ouvre sur un appareil / émulateur Android |
| `npm run ios` | Ouvre sur un simulateur iOS (macOS requis) |
| `npm run web` | Ouvre dans le navigateur |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |

## Se connecter

Les identifiants de démonstration sont **déjà pré-remplis** sur l'écran de connexion :

| Champ | Valeur |
| --- | --- |
| E-mail | `tony@stayhome.cm` |
| Mot de passe | `stayhome` |

L'écran d'inscription accepte aussi n'importe quel compte valide (nom, e-mail bien formé,
mot de passe d'au moins 6 caractères).

## Parcours disponibles

- **Explorer** — recherche par ville, dates et voyageurs ; catégories ; logements
  populaires ; destinations ; coups de cœur.
- **Résultats** — filtres par type, prix maximum, équipements, réservation immédiate,
  et quatre tris.
- **Détail** — galerie photo paginée, équipements, description, hôte, avis, partage.
- **Réservation** — dates, voyageurs, moyen de paiement (Mobile Money, carte, espèces),
  détail du prix, puis confirmation avec référence.
- **Favoris** — ajout/retrait depuis n'importe quelle carte.
- **Réservations** — séjours à venir et historique, annulation.
- **Profil** — informations, statistiques, préférences, déconnexion.

Les favoris, les réservations et la session sont conservés localement
(`AsyncStorage`) et survivent au redémarrage de l'application.

## Structure

```
app/                 écrans (routage par fichiers, expo-router)
  (auth)/            connexion, inscription
  (tabs)/            Explorer, Favoris, Réservations, Profil
  search.tsx         résultats de recherche
  listing/[id].tsx   détail d'un logement
  checkout/[id].tsx  tunnel de réservation
  confirmation/[id].tsx
components/          cartes, modales (calendrier, filtres, voyageurs), kit d'UI
constants/theme.ts   couleurs, espacements, typographie, ombres
data/listings.ts     jeu de données de démonstration
lib/format.ts        dates et prix
store/app-store.tsx  session, favoris, réservations, recherche
assets/brand/        logo et planche d'identité visuelle d'origine
```

## Identité visuelle

| Rôle | Couleur |
| --- | --- |
| Bleu confiance | `#083D91` |
| Orange énergie | `#FFA726` |
| Gris clair | `#F4F6F8` |
| Gris foncé | `#1F2937` |

Typographie **Poppins** (400 / 500 / 600 / 700), embarquée dans l'application.
L'icône, l'écran de démarrage et le favicon sont dérivés de `assets/brand/logo-stayhome.png`.

## Notes techniques

- L'application est verrouillée en thème clair (`userInterfaceStyle: "light"`).
- Le calendrier est une implémentation maison plutôt que le sélecteur natif, pour un
  rendu identique sur iOS et Android.
- Les photos proviennent d'Unsplash et sont chargées à la demande : une connexion
  internet est nécessaire pour les afficher.
- L'accès aux écrans protégés passe par `Stack.Protected`, piloté par la session.
- Aucun paquet `@react-navigation/*` : depuis le SDK 56, expo-router les embarque
  lui-même et refuse de démarrer s'ils sont installés en parallèle.
