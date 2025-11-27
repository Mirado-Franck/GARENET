// components/ui/WaveHeader.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');
// Ajustement pour la barre de statut Android
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

interface WaveHeaderProps {
  height?: number;
  children?: React.ReactNode;
}

export const WaveHeader: React.FC<WaveHeaderProps> = ({ 
  height = 180, 
  children 
}) => {
  const totalHeight = height + 30;

  // Couleurs extraites pour le style du conteneur (pour éviter le flash blanc)
  const primaryColor = theme.colors.primary[500];
  const endColor = theme.colors.primary[700];

  return (
    <View style={[styles.container, { height: totalHeight, backgroundColor: primaryColor }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      
      <Svg
        width={width}
        height={totalHeight}
        viewBox={`0 0 ${width} ${totalHeight}`}
        style={styles.svg}
      >
        <Defs>
          {/* Gradient principal Bleu */}
          <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={primaryColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
          
          {/* 
             CORRECTION MOBILE : 
             Au lieu d'utiliser du Blanc transparent (rgba(255,255,255,0.2)),
             on utilise une couleur "Lumière" (Light Blue) pour éviter l'effet gris/blanc sale sur Android.
          */}
          <LinearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
          </LinearGradient>
        </Defs>
        
        {/* 1. Fond rectangulaire de sécurité (pour boucher les trous éventuels) */}
        <Path
          d={`M0,0 L${width},0 L${width},${height} L0,${height} Z`}
          fill="url(#blueGradient)"
        />

        {/* 2. La forme principale de la vague */}
        <Path
          d={`
            M0,0 
            L${width},0 
            L${width},${height - 10}
            Q${width * 0.75},${height + 30} ${width * 0.5},${height + 5}
            Q${width * 0.25},${height - 20} 0,${height + 15}
            Z
          `}
          fill="url(#blueGradient)"
        />
        
        {/* 3. Effet "Brush" décoratif (plus subtil maintenant) */}
        <Path
          d={`
            M0,${height * 0.6}
            Q${width * 0.3},${height * 0.5} ${width * 0.5},${height * 0.7}
            Q${width * 0.8},${height * 0.9} ${width},${height * 0.6}
            L${width},${height - 10}
            Q${width * 0.75},${height + 30} ${width * 0.5},${height + 5}
            Q${width * 0.25},${height - 20} 0,${height + 15}
            Z
          `}
          fill="url(#brushGradient)"
        />

        {/* Cercles décoratifs (Opacité réduite pour mobile) */}
        <Circle cx={width * 0.1} cy={height * 0.3} r={12} fill="rgba(255,255,255,0.08)" />
        <Circle cx={width * 0.9} cy={height * 0.2} r={18} fill="rgba(255,255,255,0.06)" />
        <Circle cx={width * 0.8} cy={height * 0.6} r={6} fill="rgba(255,255,255,0.1)" />
      </Svg>
      
      <View style={[styles.content, { paddingTop: STATUSBAR_HEIGHT }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: 10,
    // LA CORRECTION PRINCIPALE EST ICI :
    // On donne la même couleur de fond au conteneur que le début du dégradé.
    // Ça empêche le blanc de passer à travers les micro-espaces du SVG sur mobile.
    backgroundColor: theme.colors.primary[500], 
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    zIndex: 1, // Assure que le texte est au-dessus
  },
});

export default WaveHeader;