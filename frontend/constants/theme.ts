// constants/theme.ts
import { getThemeConfig } from './themes';

// Export du thème par défaut pour la compatibilité
// (sera remplacé dynamiquement par le Context)
export const theme = getThemeConfig('blue');

// Export du type pour TypeScript
export type Theme = typeof theme;