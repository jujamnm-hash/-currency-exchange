import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070B12",
          900: "#0B1220",
          800: "#121A2B",
          700: "#1A2438",
          600: "#243049",
        },
        ember: {
          300: "#F0C48A",
          400: "#E8A35C",
          500: "#D4893A",
          600: "#B86F28",
        },
        mist: {
          100: "#F3F0E8",
          200: "#D9D4C8",
          400: "#9A9486",
          500: "#6F6A5E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "reticle-pulse": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "note-rise": {
          "0%": { opacity: "0", transform: "translateY(18px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "reticle-pulse": "reticle-pulse 2.4s ease-in-out infinite",
        "note-rise": "note-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scan-line": "scan-line 3.2s linear infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
