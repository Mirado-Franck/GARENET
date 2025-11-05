// frontend/app/(client)/_layout.tsx
import { LogBox } from 'react-native';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';

// Supprimer le warning spécifique
LogBox.ignoreLogs([
  'Image: style.resizeMode is deprecated. Please use props.resizeMode.',
]);

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
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.neutral[300],
          height: 60,
          paddingBottom: theme.spacing.xs,
          paddingTop: theme.spacing.xs,
        },
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.secondary,
      }}
    >
      {/* 🏠 Accueil */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
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

      {/* 🚨 PAGES QUI NE DOIVENT PAS APPARAÎTRE DANS LA NAVBAR */}
      
      {/* Notification - Exclue de la navbar */}
      <Tabs.Screen
        name="notification"
        options={{
          href: null, // 👈 CECI EXCLUT LA PAGE DE LA NAVBAR
        }}
      />

      {/* Index - Exclue de la navbar */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // 👈 CECI EXCLUT LA PAGE DE LA NAVBAR
        }}
      />

      {/* 🔧 TOUTES LES AUTRES PAGES DANS LES SOUS-DOSSIERS DOIVENT ÊTRE EXCLUES */}
      
      {/* Pages dans voyages/ */}
      <Tabs.Screen
        name="voyages/detailCooperative"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="voyages/detailVoyage"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="voyages/listeCooperative"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="voyages/paiement"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="voyages/reservation"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="voyages/voyagePropose"
        options={{
          href: null,
        }}
      />

      {/* Pages dans reservations/ */}
      <Tabs.Screen
        name="reservations/detailReservation"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reservations/listeReservation"
        options={{
          href: null,
        }}
      />

      {/* Pages dans historique/ */}
      <Tabs.Screen
        name="historique/avis"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="historique/detailVoyage"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="historique/listeVoyage"
        options={{
          href: null,
        }}
      />

      {/* Pages dans profil/ */}
      <Tabs.Screen
        name="profil/modifierProfile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profil/profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}