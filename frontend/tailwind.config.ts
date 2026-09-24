import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#050505",
          card: "#0d0d0d",
          elevated: "#141414",
          border: "#222222",
          borderSubtle: "#1a1a1a",
          text: "#ffffff",
          muted: "#888888",
          subtle: "#555555",
        },
      },
      boxShadow: {
        "dark-card": "0 4px 20px 0 rgba(0, 0, 0, 0.4)",
        "dark-modal": "0 24px 48px -12px rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [],
};

export default config;
