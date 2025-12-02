// constants/themes.ts

export const THEME_COLORS = {
  // 🔵 BLEU (Océan) - Thème par défaut
  blue: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
  },

  // 🟢 VERT (Nature)
  green: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    secondary: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
  },

  // 🟣 VIOLET (Royal)
  purple: {
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    secondary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9f1239',
      900: '#831843',
    },
  },

  // 🟤 MARRON (Chocolat) – remplace visuellement l’ancien thème orange
  orange: {
    primary: {
      50:  '#f9f5f1',
      100: '#f1e4d6',
      200: '#e2c9af',
      300: '#d2ae87',
      400: '#b7855a',
      500: '#9a6539', // chocolat principal
      600: '#804f2f',
      700: '#663e26',
      800: '#4f311f',
      900: '#3a2417',
    },
    secondary: {
      50:  '#fdf8f3',
      100: '#f8ecdd',
      200: '#f0d8b8',
      300: '#e3bd8a',
      400: '#d59f5f',
      500: '#c58138', // caramel
      600: '#a5652c',
      700: '#824d22',
      800: '#643b1b',
      900: '#4b2c15',
    },
  },

  // 🔴 ROUGE (Passion)
  red: {
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
  },

  // 🟡 JAUNE – remplace visuellement l’ancien thème nuit (dark)
  dark: {
    primary: {
      50:  '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308', // jaune principal
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    secondary: {
      50:  '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },
};

// Type pour TypeScript
export type ThemeKey = keyof typeof THEME_COLORS;

// Fonction pour obtenir le thème complet avec les couleurs fixes
export const getThemeConfig = (themeKey: ThemeKey) => {
  const colors = THEME_COLORS[themeKey];

  return {
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,

      // Couleurs neutres (communes à tous les thèmes)
      neutral: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
      },

      // Couleurs sémantiques (communes à tous les thèmes)
      semantic: {
        success: '#22c55e',
        warning: '#f59e0b',
        error:   '#ef4444',
        info:    '#06b6d4',
      },

      // Couleurs de texte (communes à tous les thèmes)
      text: {
        primary:  '#0f172a',
        secondary:'#475569',
        tertiary: '#94a3b8',
        inverse:  '#ffffff',
        light:    '#e0f2fe',
      },

      // Backgrounds (communes à tous les thèmes)
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        overlay: 'rgba(255,255,255,0.2)',
      },
    },

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
      },
    },

    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 15,
      xl: 20,
      xxl: 25,
      xxxl: 30,
    },

    borderRadius: {
      sm: 8,
      md: 12,
      lg: 22,
      xl: 25,
      round: 50,
      full: 9999,
    },

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
};