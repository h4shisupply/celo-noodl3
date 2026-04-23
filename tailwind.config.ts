import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        line: "var(--line)",
        sand: "var(--sand)",
        meadow: "var(--meadow)",
        gold: "var(--gold)"
      },
      boxShadow: {
        card: "0 24px 80px rgba(12, 38, 28, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
