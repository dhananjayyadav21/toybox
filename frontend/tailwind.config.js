/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        toy: {
          coral: "#FB641B", // Flipkart Secondary Orange
          teal: "#2874F0",  // Flipkart Primary Blue
          yellow: "#FF9F00", // Flipkart Rating Gold
          purple: "#172337", // Flipkart Dark Blue Header
          dark: "#212121",   // Primary Text
          muted: "#878787",  // Secondary Text
          light: "#F1F3F6",  // Flipkart Light Grey Background
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 1px 3px rgba(0,0,0,0.08)',
        'premium-hover': '0 3px 6px rgba(0,0,0,0.12)',
        'neon-coral': 'none',
        'neon-teal': 'none',
      },
      animation: {
        'bounce-slow': 'none',
        'pulse-slow': 'none',
      }
    },
  },
  plugins: [],
}

