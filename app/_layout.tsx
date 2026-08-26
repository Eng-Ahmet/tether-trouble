import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Prevent native splash screen from auto-hiding before app is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen smoothly after layout mounts
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar hidden style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#0F172A' },
        }}
      />
    </>
  );
}
