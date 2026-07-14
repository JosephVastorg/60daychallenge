import type { Config } from "tailwindcss";

/**
 * SIXTY design tokens — ported from the prototype.
 * Dark-mode default with a light toggle (class strategy on <html>).
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Accent — electric blue
        accent: {
          DEFAULT: "#2563ff",
          bright: "#3b82f6",
        },
        // Dark surfaces
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
        // Semantic
        miss: "#ef4444",
        nutri: {
          healthy: "#22c55e",
          normal: "#eab308",
          junk: "#f97316",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      maxWidth: {
        app: "440px",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        "slide-up": "slide-up 0.28s cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fade-in 0.2s ease-out",
        "confetti-fall": "confetti-fall linear forwards",
      },
    },
  },
  plugins: [],
};

export default config;
