/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hot-pink': '#FF2D75',
        'bubblegum-pink': '#FF85B3',
        'mint-teal': '#34EEDC',
        'cool-teal': '#27C3B6',
        'sky-blue': '#87CEFA',
        'neutral-white': '#F9F9F9',
      },
      fontFamily: {
        'black': ['system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
}