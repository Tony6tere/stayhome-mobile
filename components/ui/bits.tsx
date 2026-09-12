import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Font, Radius, Shadow, Spacing, Type } from '@/constants/theme';

/** Dégradé de secours affiché pendant le chargement d'une photo distante. */
export const IMAGE_PLACEHOLDER = { blurhash: 'L6Ptjs00~q00~qWBoft70KWB4nof' };

/* -------------------------------------------------------------------------- */

export function Rating({
  value,
  count,
  size = 13,
  color = Colors.ink,
}: {
  value: number;
  count?: number;
  size?: number;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name="star" size={size} color={Colors.star} />
      <Text style={[styles.ratingValue, { fontSize: size, lineHeight: size + 5, color }]}>
        {value.toFixed(1)}
      </Text>
      {count !== undefined ? (
        <Text style={[styles.ratingCount, { fontSize: size, lineHeight: size + 5 }]}>
          ({count} avis)
        </Text>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */

export function Chip({
  label,
  icon,
  selected = false,
  onPress,
  style,
}: {
  label: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  // Toujours un Pressable (inerte sans onPress) : View n'accepte pas de style
  // sous forme de fonction, ce qui casserait silencieusement la mise en forme.
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
        style,
      ]}>
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={15}
          color={selected ? Colors.white : Colors.inkMuted}
          style={styles.chipIcon}
        />
      ) : null}
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */

export function Badge({
  label,
  tone = 'accent',
  style,
}: {
  label: string;
  tone?: 'accent' | 'primary' | 'success' | 'danger' | 'neutral';
  style?: StyleProp<ViewStyle>;
}) {
  const tones = {
    accent: { bg: Colors.accent, fg: Colors.ink },
    primary: { bg: Colors.primary, fg: Colors.white },
    success: { bg: Colors.successSoft, fg: Colors.success },
    danger: { bg: Colors.dangerSoft, fg: Colors.danger },
    neutral: { bg: Colors.surfaceAlt, fg: Colors.inkMuted },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: tones.bg }, style]}>
      <Text style={[styles.badgeLabel, { color: tones.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */

export function IconButton({
  name,
  onPress,
  color = Colors.ink,
  background = Colors.surface,
  size = 20,
  accessibilityLabel,
  style,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  color?: string;
  background?: string;
  size?: number;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: background },
        Shadow.card,
        pressed && styles.chipPressed,
        style,
      ]}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */

export function Avatar({ uri, size = 44 }: { uri: string; size?: number }) {
  return (
    <Image
      source={{ uri }}
      placeholder={IMAGE_PLACEHOLDER}
      transition={200}
      contentFit="cover"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.surfaceAlt }}
    />
  );
}

/* -------------------------------------------------------------------------- */

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={Type.section}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <View style={styles.row}>
            <Text style={styles.sectionAction}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={15} color={Colors.primary} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon,
  title,
  message,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {children ? <View style={styles.emptyAction}>{children}</View> : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },

  ratingValue: { fontFamily: Font.semibold, marginLeft: 4 },
  ratingCount: { fontFamily: Font.regular, color: Colors.inkMuted, marginLeft: 4 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipPressed: { opacity: 0.75 },
  chipIcon: { marginRight: 6 },
  chipLabel: { fontFamily: Font.medium, fontSize: 13, lineHeight: 18, color: Colors.inkMuted },
  chipLabelSelected: { color: Colors.white },

  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  badgeLabel: { fontFamily: Font.semibold, fontSize: 11, lineHeight: 15 },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionAction: { fontFamily: Font.medium, fontSize: 13, lineHeight: 18, color: Colors.primary, marginRight: 2 },

  empty: { alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: 48 },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: { ...Type.section, textAlign: 'center' },
  emptyMessage: { ...Type.bodyMuted, textAlign: 'center', marginTop: 6 },
  emptyAction: { marginTop: Spacing.xl, alignSelf: 'stretch' },

  divider: { height: 1, backgroundColor: Colors.line },
});
