/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"DotGothic16"', 'monospace'],
      },
      colors: {
        'retro-beige': '#f5f5dc',
        'retro-brown': '#8b4513',
      },
    },
  },
  plugins: [],
}
