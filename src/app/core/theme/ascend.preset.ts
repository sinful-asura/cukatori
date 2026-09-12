import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/** Personal OS 1440w warm-dark surfaces. Primary is chart blue. */
export const ascendPreset = definePreset(Aura, {
  semantic: {
    primary: palette('#0091ff'),
    colorScheme: {
      dark: {
        surface: {
          0: '#eeeeec',
          50: '#b5b3ad',
          100: '#7d7b74',
          200: '#6f6d67',
          300: '#3b3a37',
          400: '#2a2a28',
          500: '#222221',
          600: '#191918',
          700: '#191918',
          800: '#191918',
          900: '#111110',
          950: '#111110',
        },
      },
    },
  },
});
