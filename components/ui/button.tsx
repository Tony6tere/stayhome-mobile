import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
};

const BG: Record<Variant, string> = {
  primary: Colors.primary,
  accent: Colors.accent,
  secondary: Colors.surface,
  ghost: 'transparent',
  danger: Colors.dangerSoft,
};

const FG: Record<Variant, string> = {
  primary: Colors.white,
  accent: Colors.ink,
  secondary: Colors.primary,
  ghost: Colors.primary,
  danger: Colors.danger,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  icon,
  full = true,
  style,
}: Props) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      android_ripple={variant === 'ghost' ? undefined : { color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        styles.base,
        size === 'md' && styles.md,
        { backgroundColor: BG[variant] },
        variant === 'secondary' && styles.bordered,
        variant !== 'ghost' && variant !== 'secondary' && Shadow.card,
        full && styles.full,
        pressed && !inactive && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={FG[variant]} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text
            numberOfLines={1}
            style={[styles.label, size === 'md' && styles.labelMd, { color: FG[variant] }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  md: { height: 44, borderRadius: Radius.md, paddingHorizontal: Spacing.lg },
  full: { alignSelf: 'stretch' },
  bordered: { borderWidth: 1.5, borderColor: Colors.primary },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: Spacing.sm },
  label: { fontFamily: Font.semibold, fontSize: 16, lineHeight: 22 },
  labelMd: { fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
});
