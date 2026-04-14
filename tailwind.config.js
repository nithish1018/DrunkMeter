/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#53f98f',
          yellow: '#ffe45b',
          red: '#ff4d6d',
        },
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui'],
        body: ['Outfit', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        neonGreen: '0 0 20px rgba(83, 249, 143, 0.35)',
        neonYellow: '0 0 20px rgba(255, 228, 91, 0.35)',
        neonRed: '0 0 20px rgba(255, 77, 109, 0.35)',
      },
      keyframes: {
        drunkWobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.8deg)' },
          '75%': { transform: 'rotate(-0.8deg)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'drunk-wobble': 'drunkWobble 1.2s ease-in-out infinite',
        'fade-up': 'fadeUp 500ms ease-out both',
      },
    },
  },
  plugins: [],
}

