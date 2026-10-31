/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8f4",
          100: "#e5efe5",
          200: "#cce0cd",
          300: "#a4c5a6",
          400: "#75a378",
          500: "#4f6f52", // Accent / Hover Green
          600: "#3d573f",
          700: "#2d3e27", // Forest Deep
          800: "#1a4d2e", // Primary Brand Green
          900: "#133821",
          950: "#091f12",
          DEFAULT: "#1a4d2e",
          hover: "#4f6f52",
          light: "#f4f8f4",
          dark: "#133821",
        },
        primary: {
          50: "#f4f8f4",
          100: "#e5efe5",
          200: "#cce0cd",
          300: "#a4c5a6",
          400: "#75a378",
          500: "#4f6f52",
          600: "#3d573f",
          700: "#2d3e27",
          800: "#1a4d2e",
          DEFAULT: "#1a4d2e",
          hover: "#4f6f52",
          light: "#f4f8f4",
          dark: "#133821",
        },
        surface: {
          background: "#fafafa",
          card: "#ffffff",
          muted: "#f9fafb",
          border: "#e5e7eb",
          borderHover: "#4f6f52",
        },
      },
    },
  },
  plugins: [],
};
