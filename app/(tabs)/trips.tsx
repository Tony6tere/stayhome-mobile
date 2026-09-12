import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, EmptyState, IMAGE_PLACEHOLDER } from '@/components/ui/bits';
import { Button } from '@/components/ui/button';
import { Colors, Font, Radius, Shadow, Spacing, Type } from '@/constants/theme';
import { getListing } from '@/data/listings';
import { dayKey, formatDay, formatPrice, pluralize, today } from '@/lib/format';
import { useApp, type Booking } from '@/store/app-store';

type Tab = 'a-venir' | 'passees';

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookings, cancelBooking } = useApp();
  const [tab, setTab] = useState<Tab>('a-venir');

  const todayKey = useMemo(() => dayKey(today()), []);

  const { upcoming, past } = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => a.from.localeCompare(b.from));
    return {
      // Une réservation annulée sort des séjours à venir mais reste consultable
      // dans l'historique.
      upcoming: sorted.filter((b) => b.to >= todayKey && b.status === 'confirmee'),
      past: sorted
        .filter((b) => b.to < todayKey || b.status === 'annulee')
        .reverse(),
    };
  }, [bookings, todayKey]);

  const data = tab === 'a-venir' ? upcoming : past;

  const askCancel = (booking: Booking) => {
    Alert.alert(
      'Annuler la réservation',
      'Cette réservation sera marquée comme annulée. Voulez-vous continuer ?',
      [
        { text: 'Non, garder', style: 'cancel' },
        { text: 'Oui, annuler', style: 'destructive', onPress: () => cancelBooking(booking.id) },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.title}>Mes réservations</Text>
        <View style={styles.tabs}>
          {(['a-venir', 'passees'] as Tab[]).map((key) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === key }}
              style={[styles.tab, tab === key && styles.tabActive]}>
              <Text style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>
                {key === 'a-venir' ? `À venir (${upcoming.length})` : `Historique (${past.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.xxxl },
          data.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={
          <EmptyState
            icon={tab === 'a-venir' ? 'calendar-outline' : 'time-outline'}
            title={tab === 'a-venir' ? 'Aucun séjour à venir' : 'Aucun séjour passé'}
            message={
              tab === 'a-venir'
                ? 'Réservez votre prochain logement et il apparaîtra ici.'
                : 'Vos séjours terminés et annulés s’afficheront dans cet onglet.'
            }>
            {tab === 'a-venir' ? (
              <Button label="Trouver un logement" onPress={() => router.push('/(tabs)')} />
            ) : null}
          </EmptyState>
        }
        renderItem={({ item }) => (
          <BookingCard booking={item} onCancel={() => askCancel(item)} canCancel={tab === 'a-venir'} />
        )}
      />
    </View>
  );
}

function BookingCard({
  booking,
  onCancel,
  canCancel,
}: {
  booking: Booking;
  onCancel: () => void;
  canCancel: boolean;
}) {
  const router = useRouter();
  const listing = getListing(booking.listingId);

  // Garde-fou : une annonce retirée du catalogue ne doit pas faire planter la liste.
  if (!listing) {
    return (
      <View style={[styles.card, Shadow.card, styles.cardMissing]}>
        <Ionicons name="alert-circle-outline" size={20} color={Colors.inkFaint} />
        <Text style={styles.missingText}>Ce logement n’est plus disponible.</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/listing/[id]', params: { id: listing.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, Shadow.card, pressed && styles.pressed]}>
      <View style={styles.cardTop}>
        <Image
          source={{ uri: listing.images[0] }}
          placeholder={IMAGE_PLACEHOLDER}
          transition={250}
          contentFit="cover"
          style={styles.thumb}
        />
        <View style={styles.cardBody}>
          {/* Le titre occupe toute la largeur : le statut est rappelé dans le pied de carte. */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {listing.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={Colors.inkMuted} />
            <Text style={styles.location} numberOfLines={1}>
              {listing.area}, {listing.city}
            </Text>
          </View>
          <Text style={styles.dates}>
            {formatDay(booking.from)} → {formatDay(booking.to)} · {pluralize(booking.guests, 'voyageur')}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(booking.total)}</Text>
        </View>
        <View style={styles.footerActions}>
          <Badge
            label={booking.status === 'confirmee' ? 'Confirmée' : 'Annulée'}
            tone={booking.status === 'confirmee' ? 'success' : 'danger'}
          />
          {canCancel && booking.status === 'confirmee' ? (
            <Pressable
              onPress={onCancel}
              hitSlop={6}
              accessibilityRole="button"
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}>
              <Text style={styles.cancelLabel}>Annuler</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceAlt },
  pressed: { opacity: 0.85 },

  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  title: { ...Type.display, fontSize: 23, lineHeight: 31, marginBottom: Spacing.lg },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.pill, padding: 4 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: Radius.pill, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primary },
  tabLabel: { fontFamily: Font.medium, fontSize: 13, lineHeight: 18, color: Colors.inkMuted },
  tabLabelActive: { color: Colors.white, fontFamily: Font.semibold },

  list: { padding: Spacing.lg },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  gap: { height: Spacing.md },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md },
  cardMissing: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  missingText: { ...Type.caption, marginLeft: Spacing.sm },
  cardTop: { flexDirection: 'row' },
  thumb: { width: 92, height: 92, borderRadius: Radius.md, backgroundColor: Colors.surfaceAlt },
  cardBody: { flex: 1, marginLeft: Spacing.md, justifyContent: 'center' },
  cardTitle: { ...Type.label, fontFamily: Font.semibold, fontSize: 14 },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  location: { ...Type.caption, marginLeft: 3, flex: 1 },
  dates: { ...Type.caption, color: Colors.primary, fontFamily: Font.medium, marginTop: 6 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  totalLabel: { ...Type.caption, fontSize: 11 },
  totalValue: { fontFamily: Font.bold, fontSize: 16, lineHeight: 22, color: Colors.ink },
  cancelBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: Colors.dangerSoft,
  },
  cancelLabel: { fontFamily: Font.semibold, fontSize: 13, lineHeight: 18, color: Colors.danger },
});
