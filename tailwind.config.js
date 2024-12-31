/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        flash: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        }
      },
      animation: {
        flash: 'flash 100ms ease-in-out'
      }
    },
  },
  plugins: [],
};