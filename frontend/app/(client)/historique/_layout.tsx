import { LogBox } from 'react-native';
LogBox.ignoreLogs([]);

// Supprimer le warning spécifique
LogBox.ignoreLogs([
  'Image: style.resizeMode is deprecated. Please use props.resizeMode.',
]);

// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="voirHistorique" options={{ headerShown: false }} />
      <Stack.Screen name="listeVoyage" options={{ headerShown: false }} />
      <Stack.Screen name="detailVoyage" options={{ headerShown: false }} />
      <Stack.Screen name="avis" options={{ headerShown: false }} />
      <Stack.Screen name="historiquePaiement" options={{ headerShown: false }} />
    </Stack>
  );
}