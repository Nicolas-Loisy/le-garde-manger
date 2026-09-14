import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#faf3e6",
        "paper-dark": "#f0e4cc",
        ink: "#3b2f2f",
        cocoa: "#6b4226",
        rust: "#b5551b",
        sage: "#7c8f6a",
        stamp: "#b0413e",
      },
      fontFamily: {
        hand: ["var(--font-hand)"],
        script: ["var(--font-script)"],
      },
      backgroundImage: {
        "paper-texture":
          "radial-gradient(circle at 1px 1px, rgba(107,66,38,0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
