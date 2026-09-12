import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, IMAGE_PLACEHOLDER } from '@/components/ui/bits';
import { Button } from '@/components/ui/button';
import { Colors, Font, Radius, Shadow, Spacing, Type } from '@/constants/theme';
import { getListing } from '@/data/listings';
import { formatDayLong, formatPrice, pluralize } from '@/lib/format';
import { useApp } from '@/store/app-store';

export default function ConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings, user } = useApp();

  const booking = useMemo(() => bookings.find((b) => b.id === id), [bookings, id]);
  const listing = useMemo(() => getListing(booking?.listingId), [booking?.listingId]);

  // Seule la pastille est animée. Le texte, lui, n'est jamais piloté par une
  // animation : si celle-ci ne démarrait pas, le message resterait invisible.
  // `useState` avec initialiseur paresseux : la valeur animée est créée une
  // seule fois, sans lire une ref pendant le rendu.
  const [scale] = useState(() => new Animated.Value(0.6));

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [scale]);

  // Le retour matériel Android ne doit pas ramener vers le paiement.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)');
      return true;
    });
    return () => sub.remove();
  }, [router]);

  if (!booking || !listing) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Réservation introuvable"
          message="Nous n’avons pas retrouvé cette réservation.">
          <Button label="Retour à l’accueil" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.xxxl, paddingBottom: insets.bottom + Spacing.xxl },
        ]}>
        <Animated.View style={[styles.checkWrap, { transform: [{ scale }] }]}>
          <View style={styles.check}>
            <Ionicons name="checkmark" size={40} color={Colors.white} />
          </View>
        </Animated.View>

        <View>
          <Text style={styles.title}>Réservation confirmée !</Text>
          <Text style={styles.subtitle}>
            Votre séjour est bien réservé, {user?.name?.split(' ')[0] ?? 'cher voyageur'}.{'\n'}
            Un e-mail de confirmation vous a été envoyé.
          </Text>
        </View>

        <View style={[styles.card, Shadow.card]}>
          <Image
            source={{ uri: listing.images[0] }}
            placeholder={IMAGE_PLACEHOLDER}
            transition={250}
            contentFit="cover"
            style={styles.image}
          />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {listing.title}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={Colors.inkMuted} />
              <Text style={styles.location}>
                {listing.area}, {listing.city}
              </Text>
            </View>

            <View style={styles.detailBlock}>
              <Detail icon="calendar-outline" label="Arrivée" value={formatDayLong(booking.from)} />
              <Detail icon="calendar-outline" label="Départ" value={formatDayLong(booking.to)} />
              <Detail icon="people-outline" label="Voyageurs" value={pluralize(booking.guests, 'voyageur')} />
              <Detail
                icon="moon-outline"
                label="Durée"
                value={`${booking.nights} nuit${booking.nights > 1 ? 's' : ''}`}
              />
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total payé</Text>
              <Text style={styles.totalValue}>{formatPrice(booking.total)}</Text>
            </View>

            <View style={styles.reference}>
              <Text style={styles.referenceLabel}>Référence</Text>
              <Text style={styles.referenceValue}>{booking.reference}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button label="Voir mes réservations" onPress={() => router.replace('/(tabs)/trips')} />
          <Button
            label="Retour à l’accueil"
            variant="secondary"
            onPress={() => router.replace('/(tabs)')}
            style={styles.secondAction}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={16} color={Colors.primary} />
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceAlt },
  centered: { justifyContent: 'center' },
  scroll: { paddingHorizontal: Spacing.xl, alignItems: 'stretch' },

  checkWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  check: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...Type.display, fontSize: 24, lineHeight: 32, textAlign: 'center' },
  subtitle: { ...Type.bodyMuted, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xxl },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden' },
  image: { width: '100%', height: 150, backgroundColor: Colors.surfaceAlt },
  cardBody: { padding: Spacing.lg },
  cardTitle: { ...Type.section, fontSize: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  location: { ...Type.caption, marginLeft: 3 },

  detailBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: Spacing.lg,
  },
  detail: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: Spacing.lg },
  detailText: { flex: 1, marginLeft: Spacing.sm },
  detailLabel: { ...Type.caption, fontSize: 11 },
  detailValue: { ...Type.label, fontSize: 13 },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  totalLabel: { ...Type.label, color: Colors.primaryDark },
  totalValue: { fontFamily: Font.bold, fontSize: 18, lineHeight: 25, color: Colors.primary },

  reference: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  referenceLabel: { ...Type.caption },
  referenceValue: { fontFamily: Font.semibold, fontSize: 13, lineHeight: 18, color: Colors.ink },

  actions: { marginTop: Spacing.xxl },
  secondAction: { marginTop: Spacing.md },
});
