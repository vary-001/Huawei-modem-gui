/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#d97706",   // orange-choco
        dark: "#000000",
        surface: "#0b0b0b",
        border: "#1a1a1a",
        muted: "#a1a1a1",
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};