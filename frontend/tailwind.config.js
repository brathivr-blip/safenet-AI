/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        safenet: {
          bg: "#0b1220",
          panel: "#111a2b",
          border: "#1f2b42",
          accent: "#00e5a0",
          critical: "#ff3b5c",
          high: "#ff9f43",
          medium: "#ffd166",
          low: "#4dd0e1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
