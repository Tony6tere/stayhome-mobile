import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateRangeModal } from '@/components/date-range-modal';
import { FiltersModal, type Filters } from '@/components/filters-modal';
import { GuestsModal } from '@/components/guests-modal';
import { ListingCard } from '@/components/listing-card';
import { Chip, EmptyState } from '@/components/ui/bits';
import { Button } from '@/components/ui/button';
import { Colors, Font, Radius, Shadow, Spacing, Type } from '@/constants/theme';
import { LISTINGS, TYPE_LABELS, type Listing, type ListingType } from '@/data/listings';
import { formatRange, pluralize } from '@/lib/format';
import { useApp } from '@/store/app-store';

const TYPE_FILTERS: (ListingType | null)[] = [null, 'appartement', 'hotel', 'chambre', 'villa', 'studio', 'maison'];

const defaultFilters: Filters = {
  maxPrice: null,
  amenities: [],
  sort: 'recommended',
  instantOnly: false,
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { search, setSearch } = useApp();
  const params = useLocalSearchParams<{ featured?: string }>();
  const onlyFeatured = params.featured === '1';

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const results = useMemo(() => {
    const city = search.city.trim().toLowerCase();

    let list: Listing[] = LISTINGS.filter((l) => {
      if (onlyFeatured && !l.featured) return false;
      if (city && !`${l.city} ${l.area}`.toLowerCase().includes(city)) return false;
      if (search.type && l.type !== search.type) return false;
      if (l.guests < search.guests) return false;
      if (filters.maxPrice !== null && l.price > filters.maxPrice) return false;
      if (filters.instantOnly && !l.instantBook) return false;
      if (filters.amenities.length && !filters.amenities.every((a) => l.amenities.includes(a))) {
        return false;
      }
      return true;
    });

    // On trie une copie : LISTINGS ne doit jamais être réordonné en place.
    list = [...list];
    switch (filters.sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
    }
    return list;
  }, [search.city, search.type, search.guests, filters, onlyFeatured]);

  const activeFilterCount =
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.instantOnly ? 1 : 0) +
    filters.amenities.length +
    (filters.sort !== 'recommended' ? 1 : 0);

  const resetAll = () => {
    setFilters(defaultFilters);
    setSearch({ type: null, guests: 1 });
  };

  return (
    <View style={styles.root}>
      {/* En-tête de recherche */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }, Shadow.card]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Retour"
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={21} color={Colors.ink} />
          </Pressable>

          <View style={styles.summary}>
            <Text style={styles.summaryCity} numberOfLines={1}>
              {onlyFeatured ? 'Nos coups de cœur' : search.city.trim() || 'Toutes les destinations'}
            </Text>
            <View style={styles.summaryMeta}>
              <Pressable onPress={() => setDatesOpen(true)} hitSlop={6} accessibilityRole="button">
                <Text style={styles.summaryMetaText}>{formatRange(search.from, search.to, 'Dates libres')}</Text>
              </Pressable>
              <Text style={styles.summaryDot}>·</Text>
              <Pressable onPress={() => setGuestsOpen(true)} hitSlop={6} accessibilityRole="button">
                <Text style={styles.summaryMetaText}>{pluralize(search.guests, 'voyageur')}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => setFiltersOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Filtres"
            style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]}>
            <Ionicons name="options-outline" size={20} color={Colors.primary} />
            {activeFilterCount > 0 ? (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeRow}>
          {TYPE_FILTERS.map((type) => (
            <Chip
              key={type ?? 'all'}
              label={type ? TYPE_LABELS[type] : 'Tous'}
              selected={search.type === type}
              onPress={() => setSearch({ type })}
             
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.xxxl },
          results.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListHeaderComponent={
          results.length > 0 ? (
            <Text style={styles.count}>
              {results.length} logement{results.length > 1 ? 's' : ''} disponible
              {results.length > 1 ? 's' : ''}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Aucun logement trouvé"
            message="Essayez d’élargir vos critères : une autre ville, moins de voyageurs ou moins de filtres.">
            <Button label="Réinitialiser les filtres" variant="secondary" onPress={resetAll} />
          </EmptyState>
        }
        renderItem={({ item }) => <ListingCard listing={item} variant="row" />}
      />

      <FiltersModal
        visible={filtersOpen}
        value={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
        }}
      />
      <DateRangeModal
        visible={datesOpen}
        from={search.from}
        to={search.to}
        onClose={() => setDatesOpen(false)}
        onConfirm={(from, to) => {
          setSearch({ from, to });
          setDatesOpen(false);
        }}
      />
      <GuestsModal
        visible={guestsOpen}
        value={search.guests}
        onClose={() => setGuestsOpen(false)}
        onConfirm={(guests) => {
          setSearch({ guests });
          setGuestsOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceAlt },
  pressed: { opacity: 0.7 },

  header: {
    backgroundColor: Colors.surface,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: { flex: 1, marginHorizontal: Spacing.md },
  summaryCity: { ...Type.label, fontFamily: Font.semibold, fontSize: 15 },
  summaryMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  summaryMetaText: { ...Type.caption, color: Colors.primary, fontFamily: Font.medium },
  summaryDot: { ...Type.caption, marginHorizontal: 6 },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: { fontFamily: Font.bold, fontSize: 10, lineHeight: 14, color: Colors.ink },

  typeRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },

  list: { padding: Spacing.lg },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  gap: { height: Spacing.md },
  count: { ...Type.caption, marginBottom: Spacing.md },
});
