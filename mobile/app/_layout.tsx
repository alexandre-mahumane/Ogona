import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { Oxygen_700Bold } from '@expo-google-fonts/oxygen';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import '../global.css';

import { AppProviders } from '@/providers/AppProviders';
import { initMapbox } from '@/lib/maps/mapbox';
import { colors } from '@/theme/colors';

export { ErrorBoundary } from 'expo-router';

initMapbox();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Oxygen_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerShadowVisible: false,
          headerTintColor: colors.brand.DEFAULT,
          headerStyle: { backgroundColor: colors.surface.DEFAULT },
          contentStyle: { backgroundColor: colors.surface.DEFAULT },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(guest)" />
        <Stack.Screen name="(host)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
}
