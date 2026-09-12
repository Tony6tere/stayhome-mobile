import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/ui/bits';
import { Button } from '@/components/ui/button';
import { Colors, Font, Radius, Spacing, Type } from '@/constants/theme';
import { AMENITIES, type AmenityKey } from '@/data/listings';
import { formatPrice } from '@/lib/format';

export type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

export type Filters = {
  maxPrice: number | null;
  amenities: AmenityKey[];
  sort: SortKey;
  instantOnly: boolean;
};

const PRICE_STEPS = [30, 50, 80, 120, 250];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommandés' },
  { key: 'price-asc', label: 'Prix croissant' },
  { key: 'price-desc', label: 'Prix décroissant' },
  { key: 'rating', label: 'Mieux notés' },
];

const AMENITY_KEYS = Object.keys(AMENITIES) as AmenityKey[];

export function FiltersModal({
  visible,
  value,
  onClose,
  onApply,
}: {
  visible: boolean;
  value: Filters;
  onClose: () => void;
  onApply: (filters: Filters) => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      {/* Monté uniquement à l'ouverture : le brouillon repart toujours des
          filtres réellement appliqués, jamais d'une sélection abandonnée. */}
      {visible ? <FiltersContent value={value} onClose={onClose} onApply={onApply} /> : null}
    </Modal>
  );
}

function FiltersContent({
  value,
  onClose,
  onApply,
}: {
  value: Filters;
  onClose: () => void;
  onApply: (filters: Filters) => void;
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Filters>(value);

  const toggleAmenity = (key: AmenityKey) => {
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(key)
        ? d.amenities.filter((a) => a !== key)
        : [...d.amenities, key],
    }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Fermer">
          <Ionicons name="close" size={24} color={Colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Filtres</Text>
        <Pressable
          onPress={() =>
            setDraft({ maxPrice: null, amenities: [], sort: 'recommended', instantOnly: false })
          }
          hitSlop={10}
          accessibilityRole="button">
          <Text style={styles.reset}>Tout effacer</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Trier par</Text>
        <View style={styles.wrap}>
          {SORTS.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              selected={draft.sort === s.key}
              onPress={() => setDraft((d) => ({ ...d, sort: s.key }))}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Prix maximum par nuit</Text>
        <View style={styles.wrap}>
          <Chip
            label="Tous les prix"
            selected={draft.maxPrice === null}
            onPress={() => setDraft((d) => ({ ...d, maxPrice: null }))}
          />
          {PRICE_STEPS.map((p) => (
            <Chip
              key={p}
              label={`≤ ${formatPrice(p)}`}
              selected={draft.maxPrice === p}
              onPress={() => setDraft((d) => ({ ...d, maxPrice: p }))}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Réservation</Text>
        <Pressable
          onPress={() => setDraft((d) => ({ ...d, instantOnly: !d.instantOnly }))}
          accessibilityRole="switch"
          accessibilityState={{ checked: draft.instantOnly }}
          style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>Réservation immédiate</Text>
            <Text style={styles.toggleHint}>Sans attendre l’accord de l’hôte</Text>
          </View>
          <View style={[styles.switch, draft.instantOnly && styles.switchOn]}>
            <View style={[styles.knob, draft.instantOnly && styles.knobOn]} />
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Équipements</Text>
        <View style={styles.wrap}>
          {AMENITY_KEYS.map((key) => (
            <Chip
              key={key}
              label={AMENITIES[key].label}
              icon={AMENITIES[key].icon}
              selected={draft.amenities.includes(key)}
              onPress={() => toggleAmenity(key)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <Button label="Afficher les résultats" onPress={() => onApply(draft)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  headerTitle: { ...Type.section },
  reset: { fontFamily: Font.medium, fontSize: 14, lineHeight: 20, color: Colors.primary },

  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  sectionTitle: { ...Type.label, fontFamily: Font.semibold, fontSize: 15, marginBottom: Spacing.md, marginTop: Spacing.xl },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pressed: { opacity: 0.75 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  toggleText: { flex: 1, marginRight: Spacing.lg },
  toggleLabel: { ...Type.label, fontSize: 14 },
  toggleHint: { ...Type.caption },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.line,
    padding: 3,
    justifyContent: 'center',
  },
  switchOn: { backgroundColor: Colors.primary },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
  },
  knobOn: { alignSelf: 'flex-end' },

  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.surface,
  },
});
