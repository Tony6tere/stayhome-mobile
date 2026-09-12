import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Shadow } from '@/constants/theme';
import { useApp } from '@/store/app-store';

export function FavoriteButton({
  listingId,
  size = 20,
  floating = true,
  style,
}: {
  listingId: string;
  size?: number;
  floating?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { isFavorite, toggleFavorite } = useApp();
  const active = isFavorite(listingId);

  const onPress = useCallback(() => {
    // Le retour haptique n'existe pas sur le web : on l'ignore proprement.
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    toggleFavorite(listingId);
  }, [listingId, toggleFavorite]);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.base,
        { width: size + 18, height: size + 18, borderRadius: (size + 18) / 2 },
        floating && styles.floating,
        floating && Shadow.card,
        pressed && styles.pressed,
        style,
      ]}>
      <Ionicons
        name={active ? 'heart' : 'heart-outline'}
        size={size}
        color={active ? Colors.danger : floating ? Colors.ink : Colors.inkMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  floating: { backgroundColor: 'rgba(255,255,255,0.94)' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.92 }] },
});
