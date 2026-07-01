import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--primary)",
          healing: "var(--healing)",
          mint: "var(--primary-soft)",
          background: "var(--background)",
          surface: "var(--surface)",
          neutral: "var(--surface-muted)",
          alert: "var(--alert)",
          ink: "var(--text-primary)",
          muted: "var(--text-secondary)",
          border: "var(--border)",
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
