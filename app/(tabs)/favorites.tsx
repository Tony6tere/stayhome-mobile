import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingCard } from '@/components/listing-card';
import { EmptyState } from '@/components/ui/bits';
import { Button } from '@/components/ui/button';
import { Colors, Spacing, Type } from '@/constants/theme';
import { LISTINGS } from '@/data/listings';
import { pluralize } from '@/lib/format';
import { useApp } from '@/store/app-store';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites } = useApp();

  // On respecte l'ordre des favoris (le plus récent en premier) et on ignore
  // silencieusement un identifiant qui ne correspondrait plus à une annonce.
  const list = useMemo(
    () => favorites.map((id) => LISTINGS.find((l) => l.id === id)).filter((l) => l !== undefined),
    [favorites]
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.title}>Favoris</Text>
        <Text style={styles.subtitle}>
          {list.length > 0
            ? `${pluralize(list.length, 'logement')} enregistré${list.length > 1 ? 's' : ''}`
            : 'Vos coups de cœur, gardés au chaud'}
        </Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.xxxl },
          list.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Aucun favori pour l’instant"
            message="Touchez le cœur sur une annonce pour la retrouver ici en un clin d’œil.">
            <Button label="Explorer les logements" onPress={() => router.push('/(tabs)')} />
          </EmptyState>
        }
        renderItem={({ item }) => <ListingCard listing={item} variant="row" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  title: { ...Type.display, fontSize: 23, lineHeight: 31 },
  subtitle: { ...Type.caption, marginTop: 1 },
  list: { padding: Spacing.lg },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  gap: { height: Spacing.md },
});
