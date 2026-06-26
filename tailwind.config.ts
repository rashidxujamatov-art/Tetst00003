import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#1F4E79", 600: "#173e61", 50: "#eef5fc" } },
    },
  },
  plugins: [],
};
export default config;
