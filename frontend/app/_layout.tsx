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
      <Stack.Screen name="acceuil" options={{ headerShown: false }} />
      <Stack.Screen name="se-connecter" options={{ headerShown: false }} />
      <Stack.Screen name="inscription" options={{ headerShown: false }} />
      <Stack.Screen name="(client)" options={{ headerShown: false }} />
    </Stack>
  );
}