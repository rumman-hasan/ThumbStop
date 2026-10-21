import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: "#10A9D1",
          cyanSoft: "#5CC8E6",
          royal: "#2862BF",
          royalBright: "#4A82E0",
          navy: "#06152B",
          ink: "#05070B",
          surface: "#0A1A33",
          card: "#0E2140",
          mist: "#F3F8FC",
          muted: "#9DB2C9",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      maxWidth: { page: "74rem" },
    },
  },
  plugins: [],
};

export default config;
