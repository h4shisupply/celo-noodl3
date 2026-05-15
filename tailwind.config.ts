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
        page: "var(--page)",
        panel: "var(--panel)",
        "panel-soft": "var(--panel-soft)",
        ink: "var(--ink)",
        "ink-overlay": "var(--ink-overlay)",
        "ink-soft": "var(--ink-soft)",
        "ink-hover": "var(--ink-hover)",
        muted: "var(--muted)",
        "muted-soft": "var(--muted-soft)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "accent-border": "var(--accent-border)",
        "accent-focus": "var(--accent-focus)",
        mint: "var(--mint)",
        "mint-soft": "var(--mint-soft)",
        "mint-hover": "var(--mint-hover)",
        "mint-border": "var(--mint-border)",
        "mint-strong": "var(--mint-strong)",
        sun: "var(--sun)",
        "sun-soft": "var(--sun-soft)",
        "sun-hover": "var(--sun-hover)",
        "sun-border": "var(--sun-border)",
        "sun-strong": "var(--sun-strong)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
        "danger-border": "var(--danger-border)",
        success: "var(--success)"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)"
      }
    }
  },
  plugins: []
};

export default config;
