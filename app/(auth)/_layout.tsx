import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

// À la déconnexion, le groupe doit s'ouvrir sur l'écran de connexion.
export const unstable_settings = { anchor: 'login' };

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
