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
          coral: "#FF6B6B",
          teal: "#4ECDC4",
          yellow: "#FFE66D",
          purple: "#6C63FF",
          dark: "#1E293B",
          muted: "#64748B",
          light: "#F8FAFC",
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(30, 41, 59, 0.08)',
        'premium-hover': '0 20px 40px -15px rgba(30, 41, 59, 0.15)',
        'neon-coral': '0 0 15px rgba(255, 107, 107, 0.3)',
        'neon-teal': '0 0 15px rgba(78, 205, 196, 0.3)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
