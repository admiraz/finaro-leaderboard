import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'fin-bg':           '#FAFAF8',  // crisp off-white — lighter, less beige
        'fin-surface':      '#FFFFFF',  // pure white surfaces
        'fin-surface-1':    '#F4FAF7',  // rank 1 — barely-there green-white tint
        'fin-border':       '#EBEBEB',  // lighter, more refined dividers
        'fin-border-mid':   '#D5D5D5',  // mid-weight lines
        'fin-border-strong':'#ADADAD',  // strong lines / inactive badges
        'fin-text':         '#111111',  // primary — deep black
        'fin-muted':        '#888888',  // secondary labels
        'fin-faint':        '#B8B8B8',  // tertiary / placeholder
        'fin-accent':       '#3A7F6B',  // brand green — use sparingly
        'fin-error':        '#B83232',  // error states
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};

export default config;
