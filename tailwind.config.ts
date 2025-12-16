import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00be61",
        "primary-dark": "#00a854",
        background: "#FFFFFF",
        "card-bg": "#F8F9FA",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B7280",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.04)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.08)",
        hover: "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
