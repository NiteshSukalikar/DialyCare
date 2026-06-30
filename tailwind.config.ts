import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0F6E56",
          healing: "#5DCAA5",
          mint: "#E1F5EE",
          background: "#FBF7F0",
          surface: "#FFFFFF",
          neutral: "#F1EFE8",
          alert: "#D85A30",
          ink: "#2C2C2A",
          muted: "#5F6B66",
          border: "#E5E2D8",
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
        soft: "0 12px 32px rgba(15, 110, 86, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
