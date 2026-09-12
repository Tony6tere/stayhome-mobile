import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
// Depuis le SDK 56, expo-router embarque react-navigation et en réexporte
// le thème : les paquets @react-navigation/* ne doivent plus être installés.
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { AppProvider, useApp } from '@/store/app-store';

// L'écran de démarrage reste visible tant que les polices et l'état local
// ne sont pas prêts : évite le « flash » de texte en police système.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Écran d'ancrage du groupe : garantit que la bascule du garde de session
// retombe sur les onglets et non sur une route indéterminée.
export const unstable_settings = { anchor: '(tabs)' };

/** Délai au-delà duquel on affiche l'app même si polices ou stockage traînent. */
const BOOT_TIMEOUT_MS = 6000;

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.ink,
    border: Colors.line,
    notification: Colors.accent,
  },
};

function RootNavigator() {
  const { hydrated, user } = useApp();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // fontError : on continue quand même avec la police système plutôt que
  // de laisser l'utilisateur sur un écran de démarrage figé.
  const ready = hydrated && (fontsLoaded || !!fontError);

  // Filet de sécurité : quoi qu'il arrive en amont, on n'immobilise jamais
  // l'utilisateur sur l'écran de démarrage.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), BOOT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const canRender = ready || timedOut;

  // Le masquage passe par un effet, jamais par `onLayout` : les deux branches
  // de rendu ci-dessous sont toutes deux une <View> plein écran, donc React
  // réconcilie la même vue native et `onLayout` ne se redéclencherait pas —
  // l'écran de démarrage resterait affiché indéfiniment.
  useEffect(() => {
    if (canRender) SplashScreen.hideAsync().catch(() => {});
  }, [canRender]);

  if (!canRender) return <View style={styles.boot} />;

  return (
    <View style={styles.flex}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          // Animation explicite : iOS et Android se comportent alors pareil.
          animation: 'slide_from_right',
        }}>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" />
          <Stack.Screen name="listing/[id]" />
          <Stack.Screen name="checkout/[id]" />
          <Stack.Screen name="confirmation/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        </Stack.Protected>
      </Stack>
      {/* Depuis le SDK 57, l'edge-to-edge est systématique sur Android :
          `backgroundColor` et `translucent` n'existent plus sur ce composant. */}
      <StatusBar style="dark" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <AppProvider>
            <RootNavigator />
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  boot: { flex: 1, backgroundColor: Colors.background },
});
