/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        serif: ["Lora", "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        hand: ['"Dancing Script"', "cursive"],
      },
      colors: {
        primary: "#00A9F4",
        darkBg: "#0F172A",
        darkCard: "#1E293B",
        darkBorder: "#334155",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "wave-ultra-slow": "wave-canvas 30s linear infinite",
        "wave-slow": "wave-canvas 20s linear infinite",
        "wave-medium": "wave-canvas 15s linear infinite",
        "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "wave-canvas": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
