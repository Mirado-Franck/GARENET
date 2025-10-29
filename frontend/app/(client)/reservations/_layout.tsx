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
      <Stack.Screen name="listeReservation" options={{ headerShown: false }} />
      <Stack.Screen name="detailReservation" options={{ headerShown: false }} />
    </Stack>
  );
}