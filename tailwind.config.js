/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        foreground: "var(--text)",
        muted: "var(--text-muted)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-fg)",
        },
        accent: "var(--accent)",
        success: "var(--success)",
        danger: "var(--danger)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["30px", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        h2: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        h3: ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        xs: ["12px", { lineHeight: "1.5", fontWeight: "500" }],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px rgb(15 23 42 / 0.05)",
        modal: "0 24px 64px rgb(15 23 42 / 0.2)",
      },
    },
  },
  plugins: [],
};
