// frontend/app/(client)/_layout.tsx
import { LogBox } from 'react-native';

// Supprimer le warning spécifique
LogBox.ignoreLogs([
  'Image: style.resizeMode is deprecated. Please use props.resizeMode.',
]);


import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

// 🔹 Petit composant pour les icônes (simple et clair)
const TabIcon = ({
  emoji,
  color,
  focused,
}: {
  emoji: string;
  color: string;
  focused: boolean;
}) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Text
      style={{
        fontSize: 20,
        color,
      }}
    >
      {emoji}
    </Text>
    {focused && (
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
          marginTop: 4,
        }}
      />
    )}
  </View>
);

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // on cache les en-têtes
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#007bff', // bleu pour l’onglet actif
        tabBarInactiveTintColor: '#666', // gris pour les autres
      }}
    >
      {/* 🏠 Accueil */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="🏠" color={color} focused={focused} />
          ),
        }}
      />

      {/* 🚌 Voyages */}
      <Tabs.Screen
        name="voyages"
        options={{
          title: 'Voyages',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="🚌" color={color} focused={focused} />
          ),
        }}
      />

      {/* 🎫 Réservations */}
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Réservations',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="🎫" color={color} focused={focused} />
          ),
        }}
      />

      {/* 📊 Historique */}
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="📊" color={color} focused={focused} />
          ),
        }}
      />

      {/* 👤 Profil */}
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="👤" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
