import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors, Font, Radius, Spacing, Type } from '@/constants/theme';

type Props = {
  visible: boolean;
  value: number;
  max?: number;
  onClose: () => void;
  onConfirm: (guests: number) => void;
};

export function GuestsModal({ visible, value, max = 12, onClose, onConfirm }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      {/* Monté uniquement à l'ouverture : le compteur repart toujours de `value`. */}
      {visible ? <GuestsContent value={value} max={max} onClose={onClose} onConfirm={onConfirm} /> : null}
    </Modal>
  );
}

function GuestsContent({ value, max, onClose, onConfirm }: Omit<Props, 'visible'> & { max: number }) {
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState(value);

  const clamp = (n: number) => Math.min(max, Math.max(1, n));

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Voyageurs</Text>
        <Text style={styles.subtitle}>Combien de personnes séjournent&nbsp;?</Text>

        <View style={styles.stepperRow}>
          <Text style={styles.stepperLabel}>Voyageurs</Text>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => setCount((c) => clamp(c - 1))}
              disabled={count <= 1}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Retirer un voyageur"
              style={({ pressed }) => [styles.stepBtn, count <= 1 && styles.stepBtnOff, pressed && styles.pressed]}>
              <Ionicons name="remove" size={20} color={count <= 1 ? Colors.inkFaint : Colors.primary} />
            </Pressable>
            <Text style={styles.count}>{count}</Text>
            <Pressable
              onPress={() => setCount((c) => clamp(c + 1))}
              disabled={count >= max}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Ajouter un voyageur"
              style={({ pressed }) => [styles.stepBtn, count >= max && styles.stepBtnOff, pressed && styles.pressed]}>
              <Ionicons name="add" size={20} color={count >= max ? Colors.inkFaint : Colors.primary} />
            </Pressable>
          </View>
        </View>

        <Button label="Valider" onPress={() => onConfirm(count)} style={styles.cta} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: Colors.overlay },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.line,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  title: { ...Type.title },
  subtitle: { ...Type.bodyMuted, marginTop: 2 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxl,
  },
  stepperLabel: { ...Type.label, fontSize: 15 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnOff: { borderColor: Colors.line },
  pressed: { opacity: 0.6 },
  count: {
    fontFamily: Font.semibold,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.ink,
    minWidth: 46,
    textAlign: 'center',
  },
  cta: { marginBottom: Spacing.sm },
});
