// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';

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