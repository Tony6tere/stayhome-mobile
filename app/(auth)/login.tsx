import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Colors, Font, Radius, Spacing, Type } from '@/constants/theme';
import { DEMO_EMAIL, DEMO_PASSWORD, useApp } from '@/store/app-store';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useApp();
  const passwordRef = useRef<TextInput>(null);

  // Identifiants de démonstration pré-remplis.
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    // Si la connexion réussit, le garde du layout racine bascule tout seul
    // vers les onglets : pas de navigation manuelle à faire ici.
    if (!result.ok) {
      setError(result.error ?? 'Connexion impossible.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.primarySoft, Colors.surface]}
        style={[styles.hero, { paddingTop: insets.top + Spacing.xxl }]}>
        <Image
          source={require('@/assets/images/logo-full.png')}
          contentFit="contain"
          style={styles.logo}
          accessibilityLabel="StayHome"
        />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Content de vous revoir</Text>
          <Text style={styles.subtitle}>
            Connectez-vous pour retrouver vos favoris et vos réservations.
          </Text>

          <View style={styles.demoCard}>
            <Ionicons name="information-circle" size={18} color={Colors.primary} />
            <Text style={styles.demoText}>
              Version démo — le compte <Text style={styles.demoStrong}>{DEMO_EMAIL}</Text> est déjà
              renseigné (mot de passe <Text style={styles.demoStrong}>{DEMO_PASSWORD}</Text>).
            </Text>
          </View>

          <View style={styles.form}>
            <Field
              label="Adresse e-mail"
              icon="mail-outline"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setError(null);
              }}
              placeholder="vous@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              submitBehavior="submit"
            />
            <Field
              ref={passwordRef}
              label="Mot de passe"
              icon="lock-closed-outline"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setError(null);
              }}
              placeholder="Votre mot de passe"
              autoCapitalize="none"
              autoComplete="password"
              password
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              error={error}
            />

            <Pressable hitSlop={6} style={styles.forgot} accessibilityRole="button">
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </Pressable>

            <Button label="Se connecter" onPress={onSubmit} loading={loading} />

            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.line} />
            </View>

            <Link href="/(auth)/register" asChild>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
                <Text style={styles.secondaryText}>Créer un compte</Text>
              </Pressable>
            </Link>
          </View>

          <Text style={styles.tagline}>Plus qu’un séjour, une expérience</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  flex: { flex: 1 },
  hero: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  logo: { width: 200, height: 92 },
  scroll: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md },
  title: { ...Type.display, fontSize: 24, lineHeight: 32 },
  subtitle: { ...Type.bodyMuted, marginTop: 4, marginBottom: Spacing.xl },

  demoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  demoText: { ...Type.caption, color: Colors.primaryDark, flex: 1, marginLeft: Spacing.sm },
  demoStrong: { fontFamily: Font.semibold },

  form: { marginTop: Spacing.xs },
  forgot: { alignSelf: 'flex-end', marginBottom: Spacing.xl },
  forgotText: { fontFamily: Font.medium, fontSize: 13, lineHeight: 18, color: Colors.primary },

  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: Colors.line },
  separatorText: { ...Type.caption, marginHorizontal: Spacing.md },

  secondary: {
    height: 54,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontFamily: Font.semibold, fontSize: 16, lineHeight: 22, color: Colors.primary },
  pressed: { opacity: 0.8 },

  tagline: {
    ...Type.caption,
    textAlign: 'center',
    marginTop: Spacing.xxxl,
    color: Colors.inkFaint,
  },
});
