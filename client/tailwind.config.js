/** @type {import('tailwindcss').Config} */
const tailwindcssAnimate = require('tailwindcss-animate')

module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '360px',
      md: '768px',
      lg: '1024px',
    },
    extend: {
      colors: {
        emerald:  'rgb(var(--color-emerald))',
        gold:     'rgb(var(--color-gold))',
        magenta:  'rgb(var(--color-magenta))',
        cyan:     'rgb(var(--color-cyan))',
        cream:    'rgb(var(--color-cream))',
        'text-primary':   '#FFFFFF',
        'text-secondary': '#F3F4F6',
        screen:   'rgb(var(--bg-screen))',
        surface:  'rgb(var(--surface-rgb))',
      },
      fontFamily: {
        luckiest: ["'Luckiest Guy'", 'cursive'],
        rubik:    ["'Rubik'", 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        'soft-lg': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'hard-cr': '0 4px 0 rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'golem-gradient': 'linear-gradient(90deg, rgb(var(--color-gold)), rgb(var(--color-gold)))',
        'emerald-gradient': 'linear-gradient(to right, rgba(var(--color-emerald), 1), rgba(var(--color-emerald), 0.5))',
        'gold-gradient': 'linear-gradient(to right, rgba(var(--color-gold), 1), rgba(var(--color-gold), 0.5))',
        'magenta-gradient': 'linear-gradient(to right, rgba(var(--color-magenta), 1), rgba(var(--color-magenta), 0.5))',
        'cyan-gradient': 'linear-gradient(to right, rgba(var(--color-cyan), 1), rgba(var(--color-cyan), 0.5))',
      },
      // 🎯 Custom animations for login
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        softGlow: {
          '0%': { 
            opacity: '0.6', 
            filter: 'drop-shadow(0 0 3px rgb(var(--color-magenta)))' 
          },
          '50%': { 
            opacity: '1', 
            filter: 'drop-shadow(0 0 8px rgb(var(--color-magenta)))' 
          },
          '100%': { 
            opacity: '0.6', 
            filter: 'drop-shadow(0 0 3px rgb(var(--color-magenta)))' 
          }
        },
        subtleTwinkle: {
          '0%': {
            opacity: '0.7',
            filter: 'brightness(0.8)'
          },
          '50%': {
            opacity: '1',
            filter: 'brightness(1.2)'
          },
          '100%': {
            opacity: '0.7',
            filter: 'brightness(0.8)'
          }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 1s ease-out forwards',
        softGlow: 'softGlow 3.5s infinite ease-in-out alternate',
        subtleTwinkle: 'subtleTwinkle 4s infinite ease-in-out',
        shimmer: 'shimmer 3s infinite'
      }
    },
  },
  plugins: [
    tailwindcssAnimate
  ],
};