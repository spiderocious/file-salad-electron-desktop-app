import type { Config } from 'tailwindcss';

// The design system (colors, tokens, typography) lives in file-salad-ui-lib and
// ships as prebuilt `fs-`-prefixed utilities + CSS variables — so this config is
// NOT extended with the palette and the lib is NOT added to `content`. This
// covers only the renderer's own layout utilities (flex, spacing) on its markup.
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
