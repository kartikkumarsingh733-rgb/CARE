// Root layout — loads fonts, wraps app in safe area, sets up Expo Router
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { useAppStore } from '@/store/appStore';
import { initMLEngine } from '@/engine/mlEngine';
import { syncService } from '@/services/SyncService';
import {
  useFonts,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    AtkinsonHyperlegible_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Initialize the Machine Learning Adaptive Difficulty Engine
    // (Seeds synthetic data for the demo if database is empty, and trains the model)
    const patientId = useAppStore.getState().patient.id;
    try {
      initMLEngine(patientId);
    } catch (e) {
      console.warn('ML Engine Init Error:', e);
    }

    // Initialize Firebase Sync
    try {
      syncService.initialize();
    } catch (e) {
      console.warn('SyncService Init Error:', e);
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
