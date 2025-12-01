// frontend/app/(client)/_layout.tsx
import React from 'react';
import { LogBox } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

// Supprimer le warning spécifique
LogBox.ignoreLogs([
  'Image: style.resizeMode is deprecated. Please use props.resizeMode.',
]);

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
        },
        
        // 👇 C'EST ICI QUE ÇA SE JOUE 👇
        
        // 🔵 QUAND C'EST SÉLECTIONNÉ (FOCUS) : BLEU
        tabBarActiveTintColor: theme.colors.primary[500],
        
        // ⚫ QUAND CE N'EST PAS SÉLECTIONNÉ : NOIR
        tabBarInactiveTintColor: '#000000', 

        // Style du texte
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -4,
        },
      }}
    >
      {/* 🏠 Accueil */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* 🏢 Agences */}
      <Tabs.Screen
        name="voyages"
        options={{
          title: 'Agences',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'business' : 'business-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* 🎫 Réservations */}
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Réservations',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'ticket' : 'ticket-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* ⏱️ Historique */}
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'time' : 'time-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* 👤 Profil */}
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* 🚫 PAGES MASQUÉES */}
      <Tabs.Screen name="notification" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
      
      {/* Sous-dossiers masqués */}
      <Tabs.Screen name="voyages/detailCooperative" options={{ href: null }} />
      <Tabs.Screen name="voyages/detailVoyage" options={{ href: null }} />
      <Tabs.Screen name="voyages/listeCooperative" options={{ href: null }} />
      <Tabs.Screen name="voyages/paiement" options={{ href: null }} />
      <Tabs.Screen name="voyages/reservation" options={{ href: null }} />
      <Tabs.Screen name="voyages/voyagePropose" options={{ href: null }} />

      <Tabs.Screen name="reservations/detailReservation" options={{ href: null }} />
      <Tabs.Screen name="reservations/listeReservation" options={{ href: null }} />

      <Tabs.Screen name="historique/avis" options={{ href: null }} />
      <Tabs.Screen name="historique/detailVoyage" options={{ href: null }} />
      <Tabs.Screen name="historique/listeVoyage" options={{ href: null }} />

      <Tabs.Screen name="profil/modifierProfile" options={{ href: null }} />
      <Tabs.Screen name="profil/profile" options={{ href: null }} />
    </Tabs>
  );
}