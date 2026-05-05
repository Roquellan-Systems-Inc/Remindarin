/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foundation: 'var(--color-foundation)',
        primary: 'var(--color-primary)',
        'accent-positive': 'var(--color-accent-positive)',
        warning: 'var(--color-warning)',
        border: 'var(--color-border)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          inverse: 'var(--color-text-inverse)',
        },
      },
    },
  },
  plugins: [],
}