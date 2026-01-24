/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#1f2937",
        dark: "#0a0a0a",
        gold: "#F59E0B",
        pillarHigh: "#10B981",
        pillarMedium: "#F59E0B",
        pillarLow: "#EF4444",
      },
    }
  },
  plugins: [],
};
