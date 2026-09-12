import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Badge } from '@/components/ui/bits';
import { Colors, Font, Radius, Shadow, Spacing, Type } from '@/constants/theme';
import { CURRENT_USER_AVATAR } from '@/data/listings';
import { useApp } from '@/store/app-store';

type Item = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  hint?: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, bookings, favorites, signOut } = useApp();

  const upcoming = bookings.filter((b) => b.status === 'confirmee').length;

  const soon = (label: string) =>
    Alert.alert(label, 'Cette section sera disponible dans la version complète de StayHome.', [
      { text: 'Compris' },
    ]);

  const sections: { title: string; items: Item[] }[] = [
    {
      title: 'Mon compte',
      items: [
        {
          icon: 'calendar-outline',
          label: 'Mes réservations',
          hint: `${upcoming}`,
          onPress: () => router.push('/(tabs)/trips'),
        },
        {
          icon: 'heart-outline',
          label: 'Mes favoris',
          hint: `${favorites.length}`,
          onPress: () => router.push('/(tabs)/favorites'),
        },
        { icon: 'person-outline', label: 'Mes informations', onPress: () => soon('Mes informations') },
        { icon: 'card-outline', label: 'Moyens de paiement', onPress: () => soon('Moyens de paiement') },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => soon('Notifications') },
        { icon: 'language-outline', label: 'Langue', hint: 'Français', onPress: () => soon('Langue') },
        { icon: 'settings-outline', label: 'Paramètres', onPress: () => soon('Paramètres') },
      ],
    },
    {
      title: 'Assistance',
      items: [
        { icon: 'help-circle-outline', label: 'Aide & Support', onPress: () => soon('Aide & Support') },
        { icon: 'shield-checkmark-outline', label: 'Confidentialité', onPress: () => soon('Confidentialité') },
        { icon: 'information-circle-outline', label: 'À propos de StayHome', onPress: () => soon('À propos') },
      ],
    },
  ];

  const confirmSignOut = () => {
    Alert.alert('Se déconnecter', 'Voulez-vous vraiment quitter votre session ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxxl }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.headerTitle}>Mon profil</Text>

        <View style={[styles.identity, Shadow.card]}>
          <Avatar uri={user?.avatar ?? CURRENT_USER_AVATAR} size={64} />
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name ?? 'Invité'}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
            <Badge label={`Membre depuis ${user?.memberSince ?? '2024'}`} tone="neutral" />
          </View>
        </View>

        <View style={styles.stats}>
          <Stat value={`${upcoming}`} label="Réservations" />
          <View style={styles.statDivider} />
          <Stat value={`${favorites.length}`} label="Favoris" />
          <View style={styles.statDivider} />
          <Stat value="4.9" label="Note voyageur" />
        </View>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.group}>
            {section.items.map((item, index) => (
              <View key={item.label}>
                {index > 0 ? <View style={styles.itemDivider} /> : null}
                <Pressable
                  onPress={item.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
                  <View style={styles.itemIcon}>
                    <Ionicons name={item.icon} size={19} color={Colors.primary} />
                  </View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.hint ? <Text style={styles.itemHint}>{item.hint}</Text> : null}
                  <Ionicons name="chevron-forward" size={17} color={Colors.inkFaint} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <Pressable
          onPress={confirmSignOut}
          accessibilityRole="button"
          style={({ pressed }) => [styles.signOut, pressed && styles.itemPressed]}>
          <Ionicons name="log-out-outline" size={19} color={Colors.danger} />
          <Text style={styles.signOutLabel}>Se déconnecter</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Image
          source={require('@/assets/images/logo-mark.png')}
          contentFit="contain"
          style={styles.footerLogo}
          accessibilityLabel="StayHome"
        />
        <Text style={styles.footerTagline}>Plus qu’un séjour, une expérience</Text>
        <Text style={styles.footerVersion}>Version démo 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceAlt },

  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  headerTitle: { ...Type.display, fontSize: 23, lineHeight: 31, marginBottom: Spacing.lg },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  identityText: { flex: 1, marginLeft: Spacing.lg },
  name: { ...Type.section, fontSize: 17 },
  email: { ...Type.caption, marginBottom: 6 },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.lg,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: Font.bold, fontSize: 18, lineHeight: 25, color: Colors.primary },
  statLabel: { ...Type.caption, fontSize: 11, color: Colors.primaryDark },
  statDivider: { width: 1, height: 26, backgroundColor: 'rgba(8,61,145,0.15)' },

  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl },
  sectionTitle: { ...Type.caption, fontFamily: Font.semibold, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm, marginLeft: 4 },
  group: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
  itemPressed: { backgroundColor: Colors.surfaceAlt },
  itemDivider: { height: 1, backgroundColor: Colors.line, marginLeft: 60 },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemLabel: { ...Type.label, fontSize: 14, flex: 1 },
  itemHint: { ...Type.caption, marginRight: Spacing.sm },

  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
  },
  signOutLabel: { fontFamily: Font.semibold, fontSize: 15, lineHeight: 21, color: Colors.danger, marginLeft: Spacing.sm },

  footer: { alignItems: 'center', marginTop: Spacing.xxxl },
  footerLogo: { width: 54, height: 54, opacity: 0.9 },
  footerTagline: { ...Type.caption, marginTop: Spacing.sm },
  footerVersion: { ...Type.caption, fontSize: 11, color: Colors.inkFaint, marginTop: 2 },
});
