import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateRangeModal } from '@/components/date-range-modal';
import { FavoriteButton } from '@/components/favorite-button';
import { Avatar, Badge, Divider, EmptyState, IMAGE_PLACEHOLDER, Rating } from '@/components/ui/bits';
import { Button } from '@/components/ui/button';
import { Colors, Font, Radius, Shadow, Spacing, Type } from '@/constants/theme';
import { AMENITIES, getHost, getListing, TYPE_LABELS } from '@/data/listings';
import { formatPrice, formatRange, nightsBetween, pluralize } from '@/lib/format';
import { useApp } from '@/store/app-store';

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { search, setSearch } = useApp();

  const [photoIndex, setPhotoIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);

  const listing = useMemo(() => getListing(id), [id]);

  if (!listing) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Logement introuvable"
          message="Cette annonce n’existe plus ou le lien est incorrect.">
          <Button label="Retour à l’accueil" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </View>
    );
  }

  const host = getHost(listing.hostId);
  const nights = search.from && search.to ? nightsBetween(search.from, search.to) : 0;

  const onShare = () => {
    Share.share({
      message: `Découvre « ${listing.title} » à ${listing.city} sur StayHome — ${formatPrice(listing.price)} / nuit.`,
    }).catch(() => {
      // L'utilisateur a annulé le partage : rien à signaler.
    });
  };

  const goToCheckout = () => {
    router.push({ pathname: '/checkout/[id]', params: { id: listing.id } });
  };

  return (
    <View style={styles.root}>
      {/* La photo occupe le haut de l'écran : icônes système en blanc pour rester lisibles. */}
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        {/* Galerie */}
        <View style={{ height: 300 }}>
          <FlatList
            data={listing.images}
            keyExtractor={(uri, index) => `${listing.id}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const next = Math.round(e.nativeEvent.contentOffset.x / width);
              setPhotoIndex(next);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                placeholder={IMAGE_PLACEHOLDER}
                transition={250}
                contentFit="cover"
                style={{ width, height: 300, backgroundColor: Colors.surfaceAlt }}
              />
            )}
          />
          <LinearGradient
            colors={['rgba(8,29,61,0.45)', 'transparent']}
            style={styles.galleryTopFade}
            pointerEvents="none"
          />

          <View style={[styles.galleryBar, { top: insets.top + Spacing.sm }]}>
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              accessibilityRole="button"
              accessibilityLabel="Retour"
              hitSlop={8}
              style={({ pressed }) => [styles.roundBtn, Shadow.card, pressed && styles.pressed]}>
              <Ionicons name="arrow-back" size={20} color={Colors.ink} />
            </Pressable>
            <View style={styles.galleryActions}>
              <Pressable
                onPress={onShare}
                accessibilityRole="button"
                accessibilityLabel="Partager"
                hitSlop={8}
                style={({ pressed }) => [styles.roundBtn, Shadow.card, pressed && styles.pressed]}>
                <Ionicons name="share-outline" size={19} color={Colors.ink} />
              </Pressable>
              <FavoriteButton listingId={listing.id} style={styles.galleryHeart} />
            </View>
          </View>

          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {photoIndex + 1}/{listing.images.length}
            </Text>
          </View>
        </View>

        {/* Contenu */}
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Badge label={TYPE_LABELS[listing.type]} tone="neutral" />
              <Text style={styles.title}>{listing.title}</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.price}>{formatPrice(listing.price)}</Text>
              <Text style={styles.priceUnit}>/ nuit</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Rating value={listing.rating} count={listing.reviewCount} size={13} />
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color={Colors.primary} />
            <Text style={styles.location}>
              {listing.area}, {listing.city} — Cameroun
            </Text>
          </View>

          <View style={styles.facts}>
            <Fact icon="account-group-outline" label={pluralize(listing.guests, 'voyageur')} />
            <Fact icon="door-open" label={pluralize(listing.bedrooms, 'chambre')} />
            <Fact icon="bed-outline" label={pluralize(listing.beds, 'lit')} />
            <Fact icon="shower" label={`${listing.baths} sdb`} />
          </View>

          <Divider style={styles.divider} />

          {/* Équipements en avant */}
          <View style={styles.quickAmenities}>
            {listing.amenities.slice(0, 4).map((key) => (
              <View key={key} style={styles.quickAmenity}>
                <MaterialCommunityIcons
                  name={AMENITIES[key].icon}
                  size={22}
                  color={Colors.primary}
                />
                <Text style={styles.quickAmenityLabel} numberOfLines={2}>
                  {AMENITIES[key].label}
                </Text>
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description} numberOfLines={expanded ? undefined : 4}>
            {listing.description}
          </Text>
          <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={6} accessibilityRole="button">
            <Text style={styles.more}>{expanded ? 'Voir moins' : 'Voir plus'}</Text>
          </Pressable>

          <Divider style={styles.divider} />

          {/* Tous les équipements */}
          <Text style={styles.sectionTitle}>Équipements</Text>
          <View style={styles.amenityGrid}>
            {listing.amenities.map((key) => (
              <View key={key} style={styles.amenityPill}>
                <MaterialCommunityIcons
                  name={AMENITIES[key].icon}
                  size={16}
                  color={Colors.inkMuted}
                />
                <Text style={styles.amenityPillLabel}>{AMENITIES[key].label}</Text>
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Dates */}
          <Text style={styles.sectionTitle}>Votre séjour</Text>
          <Pressable
            onPress={() => setDatesOpen(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.dateBox, pressed && styles.pressed]}>
            <Ionicons name="calendar-outline" size={19} color={Colors.primary} />
            <View style={styles.dateText}>
              <Text style={styles.dateLabel}>Arrivée — Départ</Text>
              <Text style={styles.dateValue}>{formatRange(search.from, search.to)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.inkFaint} />
          </Pressable>

          <Divider style={styles.divider} />

          {/* Hôte */}
          <Text style={styles.sectionTitle}>Votre hôte</Text>
          <View style={styles.hostRow}>
            <Avatar uri={host.avatar} size={54} />
            <View style={styles.hostInfo}>
              <View style={styles.hostNameRow}>
                <Text style={styles.hostName}>{host.name}</Text>
                {host.superhost ? <Badge label="Superhôte" tone="accent" /> : null}
              </View>
              <Text style={styles.hostMeta}>
                Hôte depuis {host.since} · {host.responseRate}% de réponses
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Contacter ${host.name}`}
              style={({ pressed }) => [styles.contactBtn, pressed && styles.pressed]}>
              <Ionicons name="chatbubble-ellipses-outline" size={19} color={Colors.primary} />
            </Pressable>
          </View>

          <Divider style={styles.divider} />

          {/* Avis */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Avis des voyageurs</Text>
            <Rating value={listing.rating} count={listing.reviewCount} size={13} />
          </View>
          <View style={styles.reviews}>
            {listing.reviews.map((review) => (
              <View key={review.id} style={styles.review}>
                <View style={styles.reviewHead}>
                  <Avatar uri={review.avatar} size={38} />
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewAuthor}>{review.author}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? 'star' : 'star-outline'}
                        size={11}
                        color={Colors.star}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Barre de réservation */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }, Shadow.floating]}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomAmount}>
            {formatPrice(nights > 0 ? listing.price * nights : listing.price)}
            <Text style={styles.bottomUnit}>{nights > 0 ? ` / ${nights} nuit${nights > 1 ? 's' : ''}` : ' / nuit'}</Text>
          </Text>
          <Text style={styles.bottomDates}>{formatRange(search.from, search.to, 'Dates à choisir')}</Text>
        </View>
        <Button label="Réserver maintenant" onPress={goToCheckout} full={false} style={styles.bookBtn} />
      </View>

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
    </View>
  );
}

function Fact({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
}) {
  return (
    <View style={styles.fact}>
      <MaterialCommunityIcons name={icon} size={18} color={Colors.inkMuted} />
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  centered: { justifyContent: 'center' },
  pressed: { opacity: 0.7 },

  galleryTopFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 110 },
  galleryBar: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryActions: { flexDirection: 'row', alignItems: 'center' },
  galleryHeart: { marginLeft: Spacing.sm },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xxl,
    backgroundColor: 'rgba(8,29,61,0.72)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  counterText: { fontFamily: Font.medium, fontSize: 11, lineHeight: 16, color: Colors.white },

  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    marginTop: -Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  titleCol: { flex: 1, marginRight: Spacing.md },
  title: { ...Type.title, marginTop: 6 },
  priceCol: { alignItems: 'flex-end', paddingTop: Spacing.lg },
  price: { fontFamily: Font.bold, fontSize: 22, lineHeight: 29, color: Colors.primary },
  priceUnit: { ...Type.caption },

  metaRow: { marginTop: Spacing.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  location: { ...Type.bodyMuted, fontSize: 13, marginLeft: 4 },

  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg, marginTop: Spacing.lg },
  fact: { flexDirection: 'row', alignItems: 'center' },
  factLabel: { ...Type.caption, marginLeft: 5, color: Colors.inkMuted },

  divider: { marginVertical: Spacing.xl },

  quickAmenities: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAmenity: { alignItems: 'center', flex: 1, paddingHorizontal: 2 },
  quickAmenityLabel: {
    fontFamily: Font.medium,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.inkMuted,
    marginTop: 6,
    textAlign: 'center',
  },

  sectionTitle: { ...Type.section, marginBottom: Spacing.md },
  description: { ...Type.body, color: Colors.inkMuted, lineHeight: 22 },
  more: { fontFamily: Font.semibold, fontSize: 13, lineHeight: 19, color: Colors.primary, marginTop: 6 },

  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  amenityPillLabel: { ...Type.caption, color: Colors.ink, marginLeft: 6 },

  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  dateText: { flex: 1, marginLeft: Spacing.md },
  dateLabel: { ...Type.caption },
  dateValue: { ...Type.label, fontFamily: Font.semibold, fontSize: 14, marginTop: 1 },

  hostRow: { flexDirection: 'row', alignItems: 'center' },
  hostInfo: { flex: 1, marginLeft: Spacing.md },
  hostNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.sm },
  hostName: { ...Type.label, fontFamily: Font.semibold, fontSize: 15 },
  hostMeta: { ...Type.caption, marginTop: 2 },
  contactBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reviewsHeader: { marginBottom: Spacing.lg },
  reviews: { gap: Spacing.lg },
  review: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  reviewHead: { flexDirection: 'row', alignItems: 'center' },
  reviewMeta: { flex: 1, marginLeft: Spacing.md },
  reviewAuthor: { ...Type.label, fontFamily: Font.semibold, fontSize: 14 },
  reviewDate: { ...Type.caption },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewText: { ...Type.bodyMuted, fontSize: 13, lineHeight: 20, marginTop: Spacing.md },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  bottomPrice: { flex: 1, marginRight: Spacing.lg },
  bottomAmount: { fontFamily: Font.bold, fontSize: 18, lineHeight: 25, color: Colors.ink },
  bottomUnit: { fontFamily: Font.regular, fontSize: 12, lineHeight: 17, color: Colors.inkMuted },
  bottomDates: { ...Type.caption, marginTop: 1 },
  bookBtn: { minWidth: 168 },
});
