// components/ui/NavBar.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';

interface NavBarProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}

export default function NavBar({ 
  title = 'GARENET', 
  showBackButton = true,
  rightComponent 
}: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleLogoPress = () => {
    router.replace('/(client)');
  };

  // Ne pas afficher la NavBar sur les pages d'authentification
  if (pathname === '/se-connecter' || pathname === '/inscription') {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Bouton retour */}
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}

        {/* Titre/Logo */}
        <TouchableOpacity onPress={handleLogoPress}>
          <Text style={styles.title}>🌱 {title}</Text>
        </TouchableOpacity>

        {/* Composant droit */}
        <View style={styles.rightContainer}>
          {rightComponent || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4CAF50',
    paddingTop: 50, // Pour la status bar
    paddingBottom: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
});