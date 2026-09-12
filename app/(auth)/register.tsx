import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { useApp } from '@/store/app-store';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useApp();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const result = await signUp(name, email, password);
    if (!result.ok) {
      setError(result.error ?? 'Inscription impossible.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Créer votre compte</Text>
          <Text style={styles.subtitle}>
            Quelques secondes suffisent pour commencer à réserver sur StayHome.
          </Text>

          <View>
            <Field
              label="Nom complet"
              icon="person-outline"
              value={name}
              onChangeText={(v) => {
                setName(v);
                setError(null);
              }}
              placeholder="Ex : Tony Tere"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              submitBehavior="submit"
            />
            <Field
              ref={emailRef}
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
              placeholder="6 caractères minimum"
              autoCapitalize="none"
              password
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              error={error}
            />

            <View style={styles.noticeCard}>
              <Ionicons name="shield-checkmark-outline" size={17} color={Colors.primary} />
              <Text style={styles.noticeText}>
                Démo hors ligne : aucune donnée n’est envoyée sur un serveur.
              </Text>
            </View>

            <Button label="Créer mon compte" onPress={onSubmit} loading={loading} />

            <Pressable
              onPress={() => router.back()}
              style={styles.loginLink}
              accessibilityRole="button">
              <Text style={styles.loginText}>
                Déjà inscrit ? <Text style={styles.loginStrong}>Se connecter</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg },
  title: { ...Type.display, fontSize: 24, lineHeight: 32 },
  subtitle: { ...Type.bodyMuted, marginTop: 4, marginBottom: Spacing.xxl },

  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  noticeText: { ...Type.caption, color: Colors.primaryDark, flex: 1, marginLeft: Spacing.sm },

  loginLink: { alignItems: 'center', marginTop: Spacing.xl },
  loginText: { ...Type.bodyMuted, fontSize: 13 },
  loginStrong: { fontFamily: Font.semibold, color: Colors.primary },
});
