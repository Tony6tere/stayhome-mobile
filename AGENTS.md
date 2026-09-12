# StayHome — repères pour travailler sur ce projet

Expo A CHANGÉ : lire la documentation versionnée exacte
<https://docs.expo.dev/versions/v57.0.0/> avant d'écrire du code.

## Contexte

Démo d'une application de réservation de logements au Cameroun. **Aucun backend** :
tout est local (données de démonstration + `AsyncStorage`). Ne pas introduire d'appel
réseau autre que le chargement des photos Unsplash.

## Conventions

- Interface **en français**, y compris les libellés d'accessibilité.
- Design system unique dans `constants/theme.ts` — ne jamais coder une couleur, un
  espacement ou une famille de police en dur dans un écran.
- Toujours fixer `lineHeight` sur les textes : Poppins coupe sinon les accents sur Android.
- Les dates circulent en chaînes `YYYY-MM-DD` et se manipulent **uniquement** via
  `lib/format.ts` (`new Date('2025-09-12')` est interprété en UTC et décale d'un jour).
- Navigation : `router.push({ pathname: '/listing/[id]', params: { id } })`, jamais une
  chaîne interpolée — les routes typées ne la valideraient pas.
- Android est en `edgeToEdge` : tout écran doit appliquer `useSafeAreaInsets()` en haut
  comme en bas. Aucune `SafeAreaView` implicite.
- Les ombres passent par `Shadow.card` / `Shadow.floating` (`elevation` sur Android,
  `shadow*` sur iOS).
- Ne pas conditionner l'affichage d'un contenu à une animation : si celle-ci ne démarre
  pas, le contenu resterait invisible.
- Pas de `babel.config.js` : `babel-preset-expo` n'est pas résolvable depuis la racine,
  Expo l'applique lui-même (il ajoute aussi le plugin worklets automatiquement).
- **Ne jamais installer `@react-navigation/*`** : depuis le SDK 56, expo-router embarque
  react-navigation et le bundler échoue si ces paquets sont présents. `ThemeProvider`,
  `DefaultTheme`, `DarkTheme` et `useTheme` s'importent depuis `expo-router`.
- L'état local d'une modale s'initialise en montant son contenu à l'ouverture
  (`{visible ? <Contenu … /> : null}`), jamais via un `useEffect` de synchronisation :
  la règle `react-hooks/set-state-in-effect` le refuse, et le montage conditionnel
  supprime au passage tout risque de sélection résiduelle.

## Vérifications avant de conclure

```bash
npm run typecheck
npm run lint
npx expo export --platform android --platform ios --output-dir dist   # bundle les 2 plateformes
```

Les noms d'icônes se vérifient contre le glyphmap réel, une faute étant invisible à
l'exécution :

```bash
node -e "const g=require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');console.log('nom-a-verifier' in g)"
```

Le type `IconName` de `data/listings.ts` fait cette vérification à la compilation pour
les équipements.

## Écran de démarrage

Ne jamais masquer l'écran de démarrage depuis un `onLayout` : si les deux branches de
rendu sont toutes deux une `<View>` plein écran, React réconcilie la même vue native,
la mise en page ne change pas et le callback ne se redéclenche jamais — l'application
reste bloquée sur le logo. Le masquage passe par un `useEffect` sur l'état de
préparation, doublé d'un délai maximum (`BOOT_TIMEOUT_MS`).
