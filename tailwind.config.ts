import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#d7efee",
          600: "#0f6b6a",
          700: "#0a4f4e",
          800: "#083c3b",
        },
        ink: {
          DEFAULT: "#12202b",
          soft: "#3d5263",
          muted: "#6b7f90",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
