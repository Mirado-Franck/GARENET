// constants/theme.ts
export const theme = {
  // ========== COULEURS ==========
  colors: {
    // Couleur principale (bleu moderne dégradé)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Bleu moderne principal (au lieu de #007AFF)
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Couleur secondaire (orange corail moderne dégradé)
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Orange moderne (au lieu de #FF9500)
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    
    // Couleurs neutres - tons plus doux
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a', // Gris moderne (au lieu de #999999)
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b', // Noir doux (au lieu de #333333)
    },
    
    // Couleurs sémantiques modernes
    semantic: {
      success: '#22c55e',   // Vert moderne
      warning: '#f59e0b',   // Ambre moderne
      error: '#ef4444',     // Rouge moderne
      info: '#06b6d4',      // Cyan moderne
    },
    
    // Couleurs de texte
    text: {
      primary: '#0f172a',   // Bleu-noir doux (au lieu de #333333)
      secondary: '#475569', // Gris-bleu (au lieu de #666666)
      tertiary: '#94a3b8',  // Gris clair moderne (au lieu de #999999)
      inverse: '#ffffff',
      light: '#e0f2fe',     // Bleu très clair
    },
    
    // Backgrounds
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc', // Gris très clair moderne (au lieu de #f5f5f5)
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
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: 'bold' as const,
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