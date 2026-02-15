import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Blue-Black-Gold Theme Colors
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#FFB800", // More vibrant gold
          600: "#FFA500", // #FFA500
          700: "#FF9500",
          800: "#FF8C00",
          900: "#FF7F00",
        },
        "blue-primary": "hsl(var(--blue-primary))",
        "blue-dark": "hsl(var(--blue-dark))",
        "gold-accent": "hsl(var(--gold))",
        "gold-dark": "hsl(var(--gold-dark))",
        "navy": "hsl(var(--navy))",
        "black": "hsl(var(--black))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        "ease-out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "ease-in-out-quad": "cubic-bezier(0.45, 0, 0.55, 1)",
        "ease-smooth": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "ease-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-in-out-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "ease-out-smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-ultra-smooth": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      transitionDuration: {
        "80": "80ms",
        "150": "150ms",
        "250": "250ms",
        "300": "300ms",
        "350": "350ms",
        "400": "400ms",
        "500": "500ms",
        "700": "700ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
