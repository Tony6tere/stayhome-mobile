import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors, Font, Radius, Spacing, Type } from '@/constants/theme';
import {
  addMonths,
  dayKey,
  formatMonth,
  formatRange,
  monthGrid,
  nightsBetween,
  today,
  WEEKDAYS_SHORT,
} from '@/lib/format';

type Props = {
  visible: boolean;
  from: string | null;
  to: string | null;
  onClose: () => void;
  onConfirm: (from: string | null, to: string | null) => void;
};

const MONTHS_AHEAD = 12;

export function DateRangeModal({ visible, from, to, onClose, onConfirm }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      {/* Le contenu n'est monté que pendant l'ouverture : la sélection repart
          donc toujours des props, sans effet de synchronisation. */}
      {visible ? <DateRangeContent from={from} to={to} onClose={onClose} onConfirm={onConfirm} /> : null}
    </Modal>
  );
}

function DateRangeContent({ from, to, onClose, onConfirm }: Omit<Props, 'visible'>) {
  const insets = useSafeAreaInsets();
  const [start, setStart] = useState<string | null>(from);
  const [end, setEnd] = useState<string | null>(to);

  const todayKey = useMemo(() => dayKey(today()), []);
  const months = useMemo(() => {
    const base = today();
    return Array.from({ length: MONTHS_AHEAD }, (_, i) => addMonths(base, i));
  }, []);

  const handleDay = (key: string) => {
    if (key < todayKey) return;
    // 1er tap : début. 2e tap : fin, sauf si antérieure — on repart alors du début.
    if (!start || (start && end) || key < start) {
      setStart(key);
      setEnd(null);
      return;
    }
    if (key === start) {
      setEnd(null);
      return;
    }
    setEnd(key);
  };

  const nights = start && end ? nightsBetween(start, end) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Fermer">
          <Ionicons name="close" size={24} color={Colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Choisir les dates</Text>
        <Pressable
          onPress={() => {
            setStart(null);
            setEnd(null);
          }}
          hitSlop={10}
          accessibilityRole="button">
          <Text style={styles.reset}>Effacer</Text>
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS_SHORT.map((d, i) => (
          <Text key={`${d}-${i}`} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {months.map((month) => (
          <View key={month.toISOString()} style={styles.month}>
            <Text style={styles.monthTitle}>{formatMonth(month)}</Text>
            <View style={styles.grid}>
              {monthGrid(month).map((date, index) => {
                if (!date) return <View key={`empty-${index}`} style={styles.cell} />;

                const key = dayKey(date);
                const past = key < todayKey;
                const isStart = key === start;
                const isEnd = key === end;
                const inRange = !!start && !!end && key > start && key < end;

                return (
                  <Pressable
                    key={key}
                    onPress={() => handleDay(key)}
                    disabled={past}
                    accessibilityRole="button"
                    accessibilityLabel={key}
                    accessibilityState={{ selected: isStart || isEnd, disabled: past }}
                    style={styles.cell}>
                    <View
                      style={[
                        styles.dayFill,
                        inRange && styles.dayInRange,
                        (isStart || isEnd) && styles.daySelected,
                      ]}>
                      <Text
                        style={[
                          styles.dayLabel,
                          past && styles.dayPast,
                          inRange && styles.dayInRangeLabel,
                          (isStart || isEnd) && styles.daySelectedLabel,
                        ]}>
                        {date.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <View style={styles.summary}>
          <Text style={styles.summaryRange}>{formatRange(start, end, 'Aucune date choisie')}</Text>
          <Text style={styles.summaryNights}>
            {nights > 0 ? `${nights} nuit${nights > 1 ? 's' : ''}` : 'Sélectionnez une arrivée et un départ'}
          </Text>
        </View>
        <Button
          label="Confirmer"
          full={false}
          size="md"
          disabled={!start || !end}
          onPress={() => onConfirm(start, end)}
          style={styles.confirm}
        />
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
  },
  headerTitle: { ...Type.section },
  reset: { fontFamily: Font.medium, fontSize: 14, lineHeight: 20, color: Colors.primary },

  weekdays: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Font.medium,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.inkFaint,
  },

  scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },
  month: { marginBottom: Spacing.xxl },
  monthTitle: { ...Type.label, fontFamily: Font.semibold, fontSize: 15, marginBottom: Spacing.md, paddingHorizontal: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: 46, alignItems: 'center', justifyContent: 'center' },
  dayFill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: { backgroundColor: Colors.primary },
  dayInRange: { backgroundColor: Colors.primarySoft, borderRadius: Radius.sm },
  dayLabel: { fontFamily: Font.medium, fontSize: 14, lineHeight: 20, color: Colors.ink },
  dayPast: { color: Colors.line },
  daySelectedLabel: { color: Colors.white, fontFamily: Font.semibold },
  dayInRangeLabel: { color: Colors.primary },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.surface,
  },
  summary: { flex: 1, marginRight: Spacing.lg },
  summaryRange: { ...Type.label, fontFamily: Font.semibold, fontSize: 15 },
  summaryNights: { ...Type.caption },
  confirm: { minWidth: 130 },
});
