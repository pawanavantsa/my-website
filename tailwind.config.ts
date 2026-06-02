import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0A3D91",
          accent: "#00D4D8",
          navy: "#051C3B",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        landing: ["var(--font-hero-title)", "var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 48px rgba(0, 212, 216, 0.28)",
        "glow-sm": "0 0 24px rgba(0, 212, 216, 0.22)",
        card: "0 8px 32px rgba(5, 28, 59, 0.08)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 212, 216, 0.18), transparent), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(10, 61, 145, 0.12), transparent), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(10, 61, 145, 0.08), transparent)",
        "gradient-brand": "linear-gradient(135deg, #0A3D91 0%, #00D4D8 100%)",
        "gradient-subtle":
          "linear-gradient(180deg, rgba(10, 61, 145, 0.04) 0%, transparent 50%)",
        "hero-mesh-dark":
          "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(0, 212, 216, 0.22), transparent), radial-gradient(ellipse 55% 45% at 100% 0%, rgba(10, 61, 145, 0.35), transparent), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(10, 61, 145, 0.2), transparent)",
        "gradient-subtle-dark":
          "linear-gradient(180deg, rgba(0, 212, 216, 0.06) 0%, transparent 55%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        shimmer: "shimmer 8s ease-in-out infinite",
        "gradient-x": "gradient-x 10s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.85", filter: "brightness(1.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
    },
  },
  plugins: [],
};

export default config;
