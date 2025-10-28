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
      <Stack.Screen name="listeCooperative" options={{ headerShown: false }} />
      <Stack.Screen name="detailCooperative" options={{ headerShown: false }} />
      <Stack.Screen name="detailVoyage" options={{ headerShown: false }} />
      <Stack.Screen name="paiement" options={{ headerShown: false }} />
      <Stack.Screen name="VoyagePropose" options={{ headerShown: false }} />
      <Stack.Screen name="reservation" options={{ headerShown: false }} />
    </Stack>
  );
}