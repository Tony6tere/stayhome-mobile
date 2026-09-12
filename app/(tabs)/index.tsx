import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateRangeModal } from '@/components/date-range-modal';
import { GuestsModal } from '@/components/guests-modal';
import { ListingCard } from '@/components/listing-card';
import { Avatar, IMAGE_PLACEHOLDER, SectionHeader } from '@/components/ui/bits';
import { Button } from '@/components/ui/button';
import { Colors, Font, Radius, Shadow, Spacing, Type } from '@/constants/theme';
import { CITIES, CURRENT_USER_AVATAR, DESTINATIONS, LISTINGS, photo, type ListingType } from '@/data/listings';
import { formatRange, pluralize } from '@/lib/format';
import { useApp } from '@/store/app-store';

const HERO = photo('1600607687939-ce8a6c25118c', 1200);

// Quatre catégories : au-delà, « Appartements » ne tient plus sur une ligne
// à 390 px de large. Les villas restent accessibles via les filtres.
const CATEGORIES: { key: ListingType | 'featured'; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { key: 'appartement', label: 'Appartements', icon: 'home-city-outline' },
  { key: 'hotel', label: 'Hôtels', icon: 'office-building-outline' },
  { key: 'chambre', label: 'Chambres', icon: 'bed-outline' },
  { key: 'featured', label: 'À la une', icon: 'star-outline' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, search, setSearch } = useApp();

  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const popular = useMemo(() => [...LISTINGS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6), []);
  const featured = useMemo(() => LISTINGS.filter((l) => l.featured).slice(0, 4), []);

  const suggestions = useMemo(() => {
    const q = search.city.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [search.city]);

  const runSearch = (patch?: { type?: ListingType | null; city?: string; featured?: boolean }) => {
    setSuggestOpen(false);
    if (patch?.type !== undefined) setSearch({ type: patch.type });
    if (patch?.city !== undefined) setSearch({ city: patch.city });
    router.push({
      pathname: '/search',
      params: patch?.featured ? { featured: '1' } : {},
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}>
        {/* En-tête */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <Image
            source={require('@/assets/images/logo-full.png')}
            contentFit="contain"
            style={styles.logo}
            accessibilityLabel="StayHome"
          />
          <View style={styles.headerActions}>
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={({ pressed }) => [styles.bell, pressed && styles.pressed]}>
              <Ionicons name="notifications-outline" size={21} color={Colors.ink} />
              <View style={styles.bellDot} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              accessibilityRole="button"
              accessibilityLabel="Mon profil"
              style={({ pressed }) => pressed && styles.pressed}>
              <Avatar uri={user?.avatar ?? CURRENT_USER_AVATAR} size={38} />
            </Pressable>
          </View>
        </View>

        {/* Bannière */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: HERO }}
            placeholder={IMAGE_PLACEHOLDER}
            transition={300}
            contentFit="cover"
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(8,61,145,0.15)', 'rgba(8,29,61,0.86)']}
            style={styles.heroOverlay}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Trouvez le logement idéal pour votre séjour</Text>
            <Text style={styles.heroSubtitle}>
              Appartements, hôtels, chambres… partout, près de vous.
            </Text>
          </View>
        </View>

        {/* Carte de recherche */}
        <View style={[styles.searchCard, Shadow.floating]}>
          <View style={styles.searchRow}>
            <Ionicons name="location-outline" size={19} color={Colors.primary} />
            <View style={styles.searchField}>
              <Text style={styles.searchLabel}>Où allez-vous ?</Text>
              <TextInput
                value={search.city}
                onChangeText={(v) => {
                  setSearch({ city: v });
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                placeholder="Ex : Douala, Yaoundé, Kribi…"
                placeholderTextColor={Colors.inkFaint}
                style={styles.searchInput}
                returnKeyType="search"
                onSubmitEditing={() => runSearch()}
              />
            </View>
            {search.city.length > 0 ? (
              <Pressable
                onPress={() => setSearch({ city: '' })}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Effacer la destination">
                <Ionicons name="close-circle" size={18} color={Colors.inkFaint} />
              </Pressable>
            ) : null}
          </View>

          {suggestOpen && suggestions.length > 0 ? (
            <View style={styles.suggestions}>
              {suggestions.map((city) => (
                <Pressable
                  key={city}
                  onPress={() => {
                    setSearch({ city });
                    setSuggestOpen(false);
                  }}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.suggestion, pressed && styles.suggestionPressed]}>
                  <Ionicons name="location" size={15} color={Colors.primary} />
                  <Text style={styles.suggestionText}>{city}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.searchSplit}>
            <Pressable
              onPress={() => {
                setSuggestOpen(false);
                setDatesOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Choisir les dates"
              style={({ pressed }) => [styles.splitItem, pressed && styles.suggestionPressed]}>
              <Ionicons name="calendar-outline" size={17} color={Colors.primary} />
              <View style={styles.splitText}>
                <Text style={styles.searchLabel}>Dates</Text>
                <Text style={styles.splitValue} numberOfLines={1}>
                  {formatRange(search.from, search.to)}
                </Text>
              </View>
            </Pressable>

            <View style={styles.vDivider} />

            <Pressable
              onPress={() => {
                setSuggestOpen(false);
                setGuestsOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Choisir le nombre de voyageurs"
              style={({ pressed }) => [styles.splitItem, pressed && styles.suggestionPressed]}>
              <Ionicons name="people-outline" size={17} color={Colors.primary} />
              <View style={styles.splitText}>
                <Text style={styles.searchLabel}>Voyageurs</Text>
                <Text style={styles.splitValue} numberOfLines={1}>
                  {pluralize(search.guests, 'voyageur')}
                </Text>
              </View>
            </Pressable>
          </View>

          <Button
            label="Rechercher"
            onPress={() => runSearch()}
            icon={<Ionicons name="search" size={18} color={Colors.white} />}
            style={styles.searchButton}
          />
        </View>

        {/* Catégories */}
        <View style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() =>
                cat.key === 'featured'
                  ? runSearch({ type: null, featured: true })
                  : runSearch({ type: cat.key as ListingType })
              }
              accessibilityRole="button"
              style={({ pressed }) => [styles.category, pressed && styles.pressed]}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons name={cat.icon} size={21} color={Colors.primary} />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Logements populaires */}
        <View style={styles.section}>
          <SectionHeader title="Logements populaires" actionLabel="Voir tout" onAction={() => runSearch()} />
        </View>
        <FlatList
          horizontal
          data={popular}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
          ItemSeparatorComponent={() => <View style={styles.hGap} />}
          renderItem={({ item }) => <ListingCard listing={item} variant="compact" />}
        />

        {/* Destinations */}
        <View style={[styles.section, styles.sectionSpaced]}>
          <SectionHeader title="Destinations populaires" />
        </View>
        <FlatList
          horizontal
          data={DESTINATIONS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
          ItemSeparatorComponent={() => <View style={styles.hGap} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => runSearch({ city: item.city, type: null })}
              accessibilityRole="button"
              accessibilityLabel={`Voir les logements à ${item.city}`}
              style={({ pressed }) => [styles.destination, pressed && styles.pressed]}>
              <Image
                source={{ uri: item.image }}
                placeholder={IMAGE_PLACEHOLDER}
                transition={250}
                contentFit="cover"
                style={styles.destinationImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(8,29,61,0.85)']}
                style={styles.destinationOverlay}
              />
              <View style={styles.destinationText}>
                <Text style={styles.destinationCity}>{item.city}</Text>
                <Text style={styles.destinationLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            </Pressable>
          )}
        />

        {/* Coups de cœur */}
        <View style={[styles.section, styles.sectionSpaced]}>
          <SectionHeader
            title="Nos coups de cœur"
            actionLabel="Voir tout"
            onAction={() => runSearch({ featured: true })}
          />
          <View style={styles.vList}>
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} variant="hero" />
            ))}
          </View>
        </View>
      </ScrollView>

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
  scroll: { paddingBottom: Spacing.xxxl },
  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  logo: { width: 132, height: 42 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  bell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.surfaceAlt,
  },

  heroWrap: {
    height: 210,
    backgroundColor: Colors.primary,
    justifyContent: 'flex-end',
  },
  heroImage: { ...StyleSheet.absoluteFill },
  heroOverlay: { ...StyleSheet.absoluteFill },
  heroContent: { padding: Spacing.xl, paddingBottom: Spacing.xxxl + Spacing.lg },
  heroTitle: {
    fontFamily: Font.bold,
    fontSize: 23,
    lineHeight: 31,
    color: Colors.white,
    maxWidth: '92%',
  },
  heroSubtitle: {
    fontFamily: Font.regular,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },

  searchCard: {
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.xxxl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchField: { flex: 1, marginLeft: Spacing.md },
  searchLabel: { fontFamily: Font.medium, fontSize: 11, lineHeight: 15, color: Colors.inkFaint },
  searchInput: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.ink,
    padding: 0,
    marginTop: 1,
    minHeight: 20,
  },

  suggestions: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  suggestionPressed: { backgroundColor: Colors.primarySoft },
  suggestionText: { ...Type.label, marginLeft: Spacing.sm },

  divider: { height: 1, backgroundColor: Colors.line, marginVertical: Spacing.md },
  searchSplit: { flexDirection: 'row', alignItems: 'center' },
  splitItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  splitText: { flex: 1, marginLeft: Spacing.sm },
  splitValue: { fontFamily: Font.medium, fontSize: 13, lineHeight: 18, color: Colors.ink, marginTop: 1 },
  vDivider: { width: 1, height: 32, backgroundColor: Colors.line, marginHorizontal: Spacing.sm },
  searchButton: { marginTop: Spacing.lg },

  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
  },
  category: { alignItems: 'center', width: 82 },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  categoryLabel: {
    fontFamily: Font.medium,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.inkMuted,
    marginTop: 6,
    textAlign: 'center',
  },

  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl },
  sectionSpaced: { marginTop: Spacing.xxxl },
  hList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
  hGap: { width: Spacing.md },
  vList: { gap: Spacing.lg },

  destination: {
    width: 158,
    height: 112,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
  },
  destinationImage: { ...StyleSheet.absoluteFill },
  destinationOverlay: { ...StyleSheet.absoluteFill },
  destinationText: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  destinationCity: { fontFamily: Font.semibold, fontSize: 15, lineHeight: 21, color: Colors.white },
  destinationLabel: {
    fontFamily: Font.regular,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.88)',
  },
});
