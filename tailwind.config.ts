import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f2f7f5",
          100: "#dcebe4",
          200: "#b8d6c9",
          300: "#86b8a5",
          400: "#54967e",
          500: "#377a63",
          600: "#28614f",
          700: "#214e41",
          800: "#1c3f35",
          900: "#18352d",
          950: "#0b2420",
        },
        mint: {
          50: "#f0faf6",
          100: "#d9f2e8",
          200: "#b5e5d2",
          300: "#83d1b5",
          400: "#4fb594",
          500: "#2f997a",
          600: "#217b62",
          700: "#1c6250",
          800: "#194f41",
          900: "#164136",
        },
        copper: {
          400: "#d4a574",
          500: "#c4894a",
          600: "#a66d35",
        },
        rose: {
          soft: "#c45c5c",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Tahoma", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 12px 40px -16px rgba(11, 36, 32, 0.35)",
        lift: "0 8px 24px -8px rgba(11, 36, 32, 0.28)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        "fade-in": "fade-in 0.35s ease-out both",
        "scale-in": "scale-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
