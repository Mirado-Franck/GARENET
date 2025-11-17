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
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="modifierProfile" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="help" options={{ headerShown: false }} />
    </Stack>
  );
}