import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateRangeModal } from '@/components/date-range-modal';
import { GuestsModal } from '@/components/guests-modal';
import { EmptyState, IMAGE_PLACEHOLDER, Rating } from '@/components/ui/bits';
import { Button } from '@/components/ui/button';
import { Colors, Font, Radius, Shadow, Spacing, Type } from '@/constants/theme';
import { getListing } from '@/data/listings';
import { addDays, dayKey, formatDayLong, formatPrice, nightsBetween, pluralize, today } from '@/lib/format';
import { useApp } from '@/store/app-store';

const SERVICE_RATE = 0.1;
const TOURIST_TAX_PER_NIGHT = 2;

type PaymentKey = 'mobile-money' | 'carte' | 'especes';

const PAYMENTS: { key: PaymentKey; label: string; hint: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { key: 'mobile-money', label: 'Mobile Money', hint: 'MTN MoMo · Orange Money', icon: 'cellphone' },
  { key: 'carte', label: 'Carte bancaire', hint: 'Visa · Mastercard', icon: 'credit-card-outline' },
  { key: 'especes', label: 'Espèces à l’arrivée', hint: 'À régler sur place', icon: 'cash' },
];

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { search, setSearch, addBooking } = useApp();

  const listing = useMemo(() => getListing(id), [id]);

  // Dates par défaut si l'utilisateur arrive sans sélection : le parcours de
  // démo ne doit jamais se retrouver bloqué. Elles restent modifiables.
  const fallback = useMemo(() => {
    const from = addDays(today(), 7);
    return { from: dayKey(from), to: dayKey(addDays(from, 3)) };
  }, []);

  const [from, setFrom] = useState(search.from ?? fallback.from);
  const [to, setTo] = useState(search.to ?? fallback.to);
  const [guests, setGuests] = useState(Math.min(search.guests, listing?.guests ?? search.guests));
  const [payment, setPayment] = useState<PaymentKey>('mobile-money');
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!listing) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Logement introuvable"
          message="Impossible de préparer cette réservation.">
          <Button label="Retour à l’accueil" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </View>
    );
  }

  const nights = nightsBetween(from, to);
  const subtotal = listing.price * nights;
  const serviceFee = Math.round(subtotal * SERVICE_RATE);
  const touristTax = TOURIST_TAX_PER_NIGHT * nights * guests;
  const total = subtotal + serviceFee + touristTax;

  const confirm = () => {
    if (nights <= 0 || submitting) return;
    setSubmitting(true);
    // Réservation simulée : on l'enregistre localement puis on affiche la confirmation.
    const booking = addBooking({ listingId: listing.id, from, to, guests, nights, total });
    setSearch({ from, to, guests });
    router.replace({ pathname: '/confirmation/[id]', params: { id: booking.id } });
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={21} color={Colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirmer et payer</Text>
        <View style={styles.back} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 130 + insets.bottom }]}>
        {/* Récapitulatif logement */}
        <View style={[styles.card, Shadow.card]}>
          <Image
            source={{ uri: listing.images[0] }}
            placeholder={IMAGE_PLACEHOLDER}
            transition={250}
            contentFit="cover"
            style={styles.thumb}
          />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {listing.title}
            </Text>
            <Text style={styles.cardLocation} numberOfLines={1}>
              {listing.area}, {listing.city}
            </Text>
            <Rating value={listing.rating} count={listing.reviewCount} size={12} />
          </View>
        </View>

        {/* Votre voyage */}
        <Text style={styles.sectionTitle}>Votre voyage</Text>
        <View style={styles.group}>
          <Pressable
            onPress={() => setDatesOpen(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Dates</Text>
              <Text style={styles.rowValue}>
                {formatDayLong(from)} → {formatDayLong(to)}
              </Text>
            </View>
            <Text style={styles.edit}>Modifier</Text>
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable
            onPress={() => setGuestsOpen(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Voyageurs</Text>
              <Text style={styles.rowValue}>{pluralize(guests, 'voyageur')}</Text>
            </View>
            <Text style={styles.edit}>Modifier</Text>
          </Pressable>
        </View>

        {/* Paiement */}
        <Text style={styles.sectionTitle}>Moyen de paiement</Text>
        <View style={styles.group}>
          {PAYMENTS.map((p, index) => {
            const selected = payment === p.key;
            return (
              <View key={p.key}>
                {index > 0 ? <View style={styles.rowDivider} /> : null}
                <Pressable
                  onPress={() => setPayment(p.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                  <View style={[styles.payIcon, selected && styles.payIconOn]}>
                    <MaterialCommunityIcons
                      name={p.icon}
                      size={19}
                      color={selected ? Colors.white : Colors.inkMuted}
                    />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowValue}>{p.label}</Text>
                    <Text style={styles.rowLabel}>{p.hint}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Détail du prix */}
        <Text style={styles.sectionTitle}>Détail du prix</Text>
        <View style={styles.group}>
          <PriceLine
            label={`${formatPrice(listing.price)} × ${nights} nuit${nights > 1 ? 's' : ''}`}
            value={formatPrice(subtotal)}
          />
          <PriceLine label="Frais de service StayHome" value={formatPrice(serviceFee)} />
          <PriceLine
            label={`Taxe de séjour · ${pluralize(guests, 'voyageur')} × ${nights} nuit${nights > 1 ? 's' : ''}`}
            value={formatPrice(touristTax)}
          />
          <View style={styles.rowDivider} />
          <PriceLine label="Total" value={formatPrice(total)} strong />
        </View>

        <View style={styles.notice}>
          <Ionicons name="lock-closed-outline" size={16} color={Colors.success} />
          <Text style={styles.noticeText}>
            Démo : aucun paiement réel n’est effectué et aucune donnée n’est transmise.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }, Shadow.floating]}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomTotal}>{formatPrice(total)}</Text>
          <Text style={styles.bottomMeta}>
            {nights} nuit{nights > 1 ? 's' : ''} · {pluralize(guests, 'voyageur')}
          </Text>
        </View>
        <Button
          label="Confirmer la réservation"
          onPress={confirm}
          disabled={nights <= 0}
          loading={submitting}
          full={false}
          style={styles.confirmBtn}
        />
      </View>

      <DateRangeModal
        visible={datesOpen}
        from={from}
        to={to}
        onClose={() => setDatesOpen(false)}
        onConfirm={(nextFrom, nextTo) => {
          if (nextFrom && nextTo) {
            setFrom(nextFrom);
            setTo(nextTo);
          }
          setDatesOpen(false);
        }}
      />
      <GuestsModal
        visible={guestsOpen}
        value={guests}
        max={listing.guests}
        onClose={() => setGuestsOpen(false)}
        onConfirm={(next) => {
          setGuests(next);
          setGuestsOpen(false);
        }}
      />
    </View>
  );
}

function PriceLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.priceLine}>
      <Text style={[styles.priceLabel, strong && styles.priceStrong]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.priceValue, strong && styles.priceStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceAlt },
  centered: { justifyContent: 'center' },
  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...Type.section, fontSize: 16 },

  scroll: { padding: Spacing.lg },

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  thumb: { width: 84, height: 84, borderRadius: Radius.md, backgroundColor: Colors.surfaceAlt },
  cardBody: { flex: 1, marginLeft: Spacing.md, justifyContent: 'center' },
  cardTitle: { ...Type.label, fontFamily: Font.semibold, fontSize: 14 },
  cardLocation: { ...Type.caption, marginBottom: 4 },

  sectionTitle: { ...Type.section, fontSize: 16, marginTop: Spacing.xxl, marginBottom: Spacing.md },
  group: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  rowPressed: { backgroundColor: Colors.surfaceAlt },
  rowDivider: { height: 1, backgroundColor: Colors.line, marginHorizontal: Spacing.lg },
  rowText: { flex: 1 },
  rowLabel: { ...Type.caption },
  rowValue: { ...Type.label, fontFamily: Font.semibold, fontSize: 14, marginBottom: 1 },
  edit: { fontFamily: Font.medium, fontSize: 13, lineHeight: 18, color: Colors.primary },

  payIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  payIconOn: { backgroundColor: Colors.primary },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Colors.primary },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.primary },

  priceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  priceLabel: { ...Type.bodyMuted, fontSize: 13, flex: 1, marginRight: Spacing.md },
  priceValue: { ...Type.label, fontSize: 13 },
  priceStrong: { fontFamily: Font.bold, fontSize: 15, color: Colors.ink },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.xl,
  },
  noticeText: { ...Type.caption, color: Colors.success, flex: 1, marginLeft: Spacing.sm },

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
  bottomPrice: { flex: 1, marginRight: Spacing.md },
  bottomTotal: { fontFamily: Font.bold, fontSize: 19, lineHeight: 26, color: Colors.ink },
  bottomMeta: { ...Type.caption },
  confirmBtn: { minWidth: 190 },
});
