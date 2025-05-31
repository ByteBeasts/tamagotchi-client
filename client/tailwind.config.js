/** @type {import('tailwindcss').Config} */
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
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
