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
        ivory: '#FAF7F2',
        cream: '#F5EFE6',
        rosegold: '#C9A27E',
        champagne: '#D8C3A5',
        sage: '#A8B8A3',
        darktext: '#4A403A',
        goldAccent: '#D4AF37',
        darkbg: '#121212',
        darkcard: '#1E1E1E',
        accent: '#C9A27E',
        primary: '#D8C3A5',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      animation: {
        'sway': 'sway 4s ease-in-out infinite alternate',
        'petal': 'fall 10s linear infinite',
      },
      keyframes: {
        sway: {
          '0%': { transform: 'rotate(-3deg)' },
          '100%': { transform: 'rotate(3deg)' }
        },
        fall: {
          '0%': { transform: 'translateY(-10px) translateX(0) rotate(0deg)', opacity: 0 },
          '10%': { opacity: 0.8 },
          '90%': { opacity: 0.8 },
          '100%': { transform: 'translateY(100vh) translateX(100px) rotate(360deg)', opacity: 0 }
        }
      }
    },
  },
  plugins: [],
}
