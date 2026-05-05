export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F2A44',
        foundation: '#0F172A',
        'accent-positive': '#16A34A',
        warning: '#F59E0B',
        background: '#F8FAFC',
        border: '#E2E8F0',
        'text-primary': '#020617',
        'text-secondary': '#64748B',
        'text-inverse': '#FFFFFF',
      },
    },
  },
  plugins: [],
}