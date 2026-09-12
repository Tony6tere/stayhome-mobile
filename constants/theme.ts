import { Platform, type TextStyle } from 'react-native';

/**
 * StayHome — design tokens.
 * Palette issue de l'identité visuelle : bleu confiance + orange énergie.
 */
export const Colors = {
  /** Bleu confiance — couleur primaire, actions principales */
  primary: '#083D91',
  primaryDark: '#052C6B',
  primaryLight: '#1E5BC6',
  /** Fond bleu très clair pour les surfaces secondaires */
  primarySoft: '#EAF0FB',

  /** Orange énergie — accent, notes, badges */
  accent: '#FFA726',
  accentDark: '#F57C00',
  accentSoft: '#FFF3E0',

  /** Neutres */
  ink: '#1F2937',
  inkMuted: '#5B6676',
  inkFaint: '#8A94A6',
  line: '#E4E8EF',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F6F8',
  background: '#FFFFFF',

  /** Sémantiques */
  success: '#12A150',
  successSoft: '#E6F7EE',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  star: '#FFB400',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(8, 24, 48, 0.45)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

/** Familles Poppins chargées dans app/_layout.tsx */
export const Font = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

/**
 * Poppins a un interligne naturel serré : on fixe lineHeight partout
 * pour éviter les accents coupés (é, à) sur Android.
 */
export const Type = {
  display: { fontFamily: Font.bold, fontSize: 26, lineHeight: 34, color: Colors.ink },
  title: { fontFamily: Font.semibold, fontSize: 20, lineHeight: 28, color: Colors.ink },
  section: { fontFamily: Font.semibold, fontSize: 17, lineHeight: 24, color: Colors.ink },
  body: { fontFamily: Font.regular, fontSize: 14, lineHeight: 21, color: Colors.ink },
  bodyMuted: { fontFamily: Font.regular, fontSize: 14, lineHeight: 21, color: Colors.inkMuted },
  label: { fontFamily: Font.medium, fontSize: 13, lineHeight: 19, color: Colors.ink },
  caption: { fontFamily: Font.regular, fontSize: 12, lineHeight: 17, color: Colors.inkMuted },
  price: { fontFamily: Font.bold, fontSize: 18, lineHeight: 25, color: Colors.ink },
} satisfies Record<string, TextStyle>;

/**
 * Ombres : iOS utilise shadow*, Android utilise elevation.
 * Platform.select évite les warnings « shadow* is deprecated » côté web.
 */
export const Shadow = {
  card: Platform.select({
    ios: {
      shadowColor: '#0B1B33',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 3 },
    default: {},
  }),
  floating: Platform.select({
    ios: {
      shadowColor: '#0B1B33',
      shadowOpacity: 0.14,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

/** Hauteur de la barre d'action collée en bas (hors safe area) */
export const BOTTOM_BAR_HEIGHT = 76;
