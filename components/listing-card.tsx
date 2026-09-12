import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, IMAGE_PLACEHOLDER, Rating } from '@/components/ui/bits';
import { FavoriteButton } from '@/components/favorite-button';
import { Colors, Font, Radius, Shadow, Spacing, Type } from '@/constants/theme';
import { TYPE_LABELS, type Listing } from '@/data/listings';
import { formatPrice } from '@/lib/format';

type Variant = 'hero' | 'compact' | 'row';

export function ListingCard({ listing, variant = 'hero' }: { listing: Listing; variant?: Variant }) {
  const router = useRouter();

  const open = () => {
    router.push({ pathname: '/listing/[id]', params: { id: listing.id } });
  };

  if (variant === 'row') {
    return (
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)} par nuit`}
        style={({ pressed }) => [styles.rowCard, Shadow.card, pressed && styles.pressed]}>
        <Image
          source={{ uri: listing.images[0] }}
          placeholder={IMAGE_PLACEHOLDER}
          transition={250}
          contentFit="cover"
          style={styles.rowImage}
        />
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={styles.rowTitle} numberOfLines={2}>
              {listing.title}
            </Text>
            <FavoriteButton listingId={listing.id} size={17} floating={false} />
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={Colors.inkMuted} />
            <Text style={styles.location} numberOfLines={1}>
              {listing.area}, {listing.city}
            </Text>
          </View>
          <Rating value={listing.rating} count={listing.reviewCount} size={12} />
          <View style={styles.rowFooter}>
            <Text style={styles.price}>
              {formatPrice(listing.price)}
              <Text style={styles.perNight}> / nuit</Text>
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  const compact = variant === 'compact';

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)} par nuit`}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.cardCompact : styles.cardHero,
        Shadow.card,
        pressed && styles.pressed,
      ]}>
      <View style={compact ? styles.imageWrapCompact : styles.imageWrapHero}>
        <Image
          source={{ uri: listing.images[0] }}
          placeholder={IMAGE_PLACEHOLDER}
          transition={250}
          contentFit="cover"
          style={styles.image}
        />
        <FavoriteButton listingId={listing.id} style={styles.heart} />
        {listing.instantBook ? (
          <Badge label="Réservation immédiate" tone="accent" style={styles.instantBadge} />
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {listing.title}
          </Text>
          <Rating value={listing.rating} size={13} />
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={Colors.inkMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {listing.area}, {listing.city}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {formatPrice(listing.price)}
            <Text style={styles.perNight}> / nuit</Text>
          </Text>
          <Text style={styles.typeLabel}>{TYPE_LABELS[listing.type]}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  cardHero: { alignSelf: 'stretch' },
  cardCompact: { width: 250 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },

  imageWrapHero: { height: 190, backgroundColor: Colors.surfaceAlt },
  imageWrapCompact: { height: 152, backgroundColor: Colors.surfaceAlt },
  image: { width: '100%', height: '100%' },
  heart: { position: 'absolute', top: Spacing.md, right: Spacing.md },
  instantBadge: { position: 'absolute', left: Spacing.md, bottom: Spacing.md },

  body: { padding: Spacing.lg, paddingTop: Spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...Type.label, fontFamily: Font.semibold, fontSize: 15, lineHeight: 21, flex: 1, marginRight: Spacing.sm },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  location: { ...Type.caption, marginLeft: 3, flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  price: { ...Type.price, fontSize: 17, lineHeight: 24 },
  perNight: { fontFamily: Font.regular, fontSize: 12, lineHeight: 17, color: Colors.inkMuted },
  typeLabel: { ...Type.caption, color: Colors.primary, fontFamily: Font.medium },

  // Variante ligne (résultats de recherche)
  rowCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    padding: Spacing.sm,
  },
  rowImage: {
    width: 106,
    height: 106,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  rowBody: { flex: 1, marginLeft: Spacing.md, justifyContent: 'space-between', paddingVertical: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  rowTitle: {
    fontFamily: Font.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.ink,
    flex: 1,
    marginRight: Spacing.xs,
  },
  rowFooter: { flexDirection: 'row', alignItems: 'baseline' },
});
