// app/_layout.tsx
import React from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { theme } from '../constants/theme'; // 👈 AJOUTE CET IMPORT

LogBox.ignoreLogs([]);
LogBox.ignoreLogs([
  'Image: style.resizeMode is deprecated. Please use props.resizeMode.',
]);

export default function RootLayout(): React.ReactElement {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          // 👇 OPTIONNEL : Style global basé sur le thème
          contentStyle: {
            backgroundColor: theme.colors.background.secondary,
          }
        }}
      >
        <Stack.Screen name="acceuil" options={{ headerShown: false }} />
        <Stack.Screen name="se-connecter" options={{ headerShown: false }} />
        <Stack.Screen name="inscription" options={{ headerShown: false }} />
        <Stack.Screen name="(client)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}