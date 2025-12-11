// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { LogBox } from 'react-native';

// Désactive l'affichage du LogBox pour tous les console.warn et console.error
LogBox.ignoreAllLogs(true);
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="acceuil" />
          <Stack.Screen name="se-connecter" />
          <Stack.Screen name="inscription" />
          <Stack.Screen name="(client)" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}