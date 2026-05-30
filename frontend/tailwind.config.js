/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        secondary: "#737373",
        accent: "#0095F6",
        brand: {
          pink: "#E1306C",
          purple: "#C13584",
          orange: "#F56040",
        },
        background: "#FFFFFF",
        surface: "#FFFFFF",
        border: "#DBDBDB",
      },
    },
  },
  plugins: [],
}
