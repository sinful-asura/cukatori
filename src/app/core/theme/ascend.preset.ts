import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/** Landing tokens: coral primary, deep-black surfaces. Always used in dark mode. */
export const ascendPreset = definePreset(Aura, {
  semantic: {
    primary: palette('#ff4d3a'),
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          300: '#a1a1aa',
          400: '#8b8b93',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#141418',
          900: '#101014',
          950: '#07070b',
        },
      },
    },
  },
});
