// constants/theme.ts
export const theme = {
  // ========== COULEURS ==========
  colors: {
    // Couleur principale (ton bleu #007AFF)
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9', // 👈 AJOUTÉ
      300: '#64b5f6', // 👈 AJOUTÉ
      400: '#42a5f5', // 👈 AJOUTÉ
      500: '#007AFF', // TON BLEU PRINCIPAL
      600: '#1e88e5',
      700: '#1976d2', // 👈 AJOUTÉ
      800: '#1565c0', // 👈 AJOUTÉ
      900: '#0d47a1', // 👈 AJOUTÉ
    },
    
    // Couleur secondaire (ton orange #FF9500)
    secondary: {
      50: '#fff3e0',
      100: '#ffe0b2',
      200: '#ffcc80',
      300: '#ffb74d',
      400: '#ffa726',
      500: '#FF9500', // TON ORANGE
      600: '#fb8c00',
      700: '#f57c00',
      800: '#ef6c00',
      900: '#e65100',
    },
    
    // Couleurs neutres - COMPLÉTÉES
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5', // TON BACKGROUND
      200: '#eeeeee', // 👈 AJOUTÉ
      300: '#e0e0e0', // 👈 AJOUTÉ (utilisé dans Button disabled)
      400: '#bdbdbd', // 👈 AJOUTÉ (utilisé dans SearchBar disabled)
      500: '#999999', // TON TEXTE SECONDARY
      600: '#757575', // 👈 AJOUTÉ (utilisé dans Button disabled text)
      700: '#616161', // 👈 AJOUTÉ
      800: '#424242', // 👈 AJOUTÉ
      900: '#333333', // TON TEXTE PRINCIPAL
    },
    
    // 👇 AJOUT DES COULEURS SÉMANTIQUES (manquantes)
    semantic: {
      success: '#4CAF50',   // 👈 AJOUTÉ (utilisé dans Button success)
      warning: '#FF9800',   // 👈 AJOUTÉ
      error: '#f44336',     // 👈 AJOUTÉ (utilisé dans Button danger)
      info: '#2196f3',      // 👈 AJOUTÉ
    },
    
    // Couleurs de texte
    text: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#ffffff',
      light: '#E0F2FF',
    },
    
    // Backgrounds
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      overlay: 'rgba(255,255,255,0.2)',
    }
  },

  // ========== TYPOGRAPHIE ==========
  typography: {
    sizes: {
      h1: 26,
      h2: 20,
      h3: 18,
      body: 16,
      caption: 14,
      small: 12,
    },
    weights: {
      regular: '400' as const,        // 👈 AJOUTE 'as const'
      medium: '500' as const,         // 👈 AJOUTE 'as const'  
      semibold: '600' as const,       // 👈 AJOUTE 'as const'
      bold: 'bold' as const,          // 👈 AJOUTE 'as const'
    }
  },

  // ========== ESPACEMENT ==========
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 15,
    xl: 20,
    xxl: 25,
    xxxl: 30,
  },

  // ========== BORDS ARRONDIS ==========
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 22,
    xl: 25,
    round: 50,
    full: 9999,
  },

  // ========== OMBRES ==========
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};