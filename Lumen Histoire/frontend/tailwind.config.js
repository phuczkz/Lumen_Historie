/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all relevant file types in src
  ],
  theme: {
    extend: {
      colors: {
        mint: "#00B140",
      },
    },
  },
  plugins: [],
};