/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mine: {
          bg: 'rgb(var(--color-mine-bg) / <alpha-value>)',
          surface: 'rgb(var(--color-mine-surface) / <alpha-value>)',
          'surface-alt': 'rgb(var(--color-mine-surface-alt) / <alpha-value>)',
          'text-primary': 'rgb(var(--color-mine-text-primary) / <alpha-value>)',
          'text-secondary': 'rgb(var(--color-mine-text-secondary) / <alpha-value>)',
          border: 'rgb(var(--color-mine-border) / <alpha-value>)',
        },
        status: {
          safe: '#2D8A4E',
          'safe-bg': 'var(--color-status-safe-bg, #E8F5EC)',
          warning: '#C4820E',
          'warning-bg': 'var(--color-status-warning-bg, #FDF3E0)',
          critical: '#C4362E',
          'critical-bg': 'var(--color-status-critical-bg, #FDECEB)',
          attention: '#D97706',
          'attention-bg': 'var(--color-status-attention-bg, #FEF3CD)',
          offline: '#9CA3AF',
          'offline-bg': 'var(--color-status-offline-bg, #F3F4F6)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs': ['0.6875rem', { lineHeight: '1rem' }],        // 11px
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],     // 13px
        'base': ['0.875rem', { lineHeight: '1.375rem' }],   // 14px
        'lg': ['1rem', { lineHeight: '1.5rem' }],           // 16px
        'xl': ['1.125rem', { lineHeight: '1.75rem' }],      // 18px
        '2xl': ['1.375rem', { lineHeight: '1.75rem' }],     // 22px
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
    },
  },
  plugins: [],
};
