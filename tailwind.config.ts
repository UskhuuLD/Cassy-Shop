import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { boxShadow: { soft: "0 16px 40px rgba(65,38,55,.09)" } } },
  plugins: [],
} satisfies Config;
