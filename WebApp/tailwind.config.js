/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: "#ffffff",
          100: "#ffffff",
          200: "#ffffff",
          300: "#ffffff",
          400: "#ffffff",
          500: "#ffffff",
          600: "#f5f5f5",
          700: "#e5e5e5",
          800: "#d4d4d4",
          900: "#a3a3a3",
          950: "#808080",
        },
        background: "#000000",
        surface: "#0a0a0d",
        hover: "#18181c",
        card: "#0e0e11",
        "card-hover": "#1a1a22",
        divider: "#16161a",
        primary: "#ffffff",
        secondary: "#a7a7a7",
        accent: {
          DEFAULT: "#ffffff",
          hover: "#e5e5e5",
          muted: "rgba(255,255,255,0.15)",
        },
        glass: {
          bg: "rgba(0,0,0,0.75)",
          "bg-light": "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.08)",
          "border-inner": "rgba(255,255,255,0.04)",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Montserrat", "sans-serif"],
      },
      spacing: {
        sidebar: "250px",
        "player-desktop": "95px",
        "player-mobile": "70px",
        "bottom-nav": "68px",
      },
      borderRadius: {
        glass: "16px",
        "glass-lg": "24px",
        pill: "50px",
      },
      backdropBlur: {
        glass: "30px",
        "glass-heavy": "60px",
        "glass-light": "15px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        "glass-sm": "0 4px 16px rgba(0,0,0,0.6)",
      },
      animation: {
        "pulse-logo": "pulse-logo 1.8s ease-in-out infinite",
        "spin-slow": "spin 0.8s linear infinite",
      },
      keyframes: {
        "pulse-logo": {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
      },
    },
  },
  plugins: [],
}
