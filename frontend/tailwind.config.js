/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#080B14',
          800: '#0D1120',
          700: '#111827',
          600: '#1A2238',
          500: '#243047',
        },
        accent: {
          cyan: '#00F5D4',
          blue: '#3B82F6',
          violet: '#8B5CF6',
          amber: '#F59E0B',
          rose: '#F43F5E',
          emerald: '#10B981',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'mesh-dark': 'radial-gradient(at 40% 20%, #0f2027 0px, transparent 50%), radial-gradient(at 80% 0%, #1a1a3e 0px, transparent 50%), radial-gradient(at 0% 50%, #0d1b2a 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
