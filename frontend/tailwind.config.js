/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#2D5016',
        'secondary-green': '#52B788',
        'accent-yellow': '#FFD60A'
      }
    },
  },
  plugins: [],
}
