import type { Config } from "tailwindcss";


const config: Config = {
darkMode: "class", // ⟵ IMPORTANT
content: [
"./app/**/*.{ts,tsx}",
"./components/**/*.{ts,tsx}",
"./pages/**/*.{ts,tsx}",
"./src/**/*.{ts,tsx}",
],
theme: {
extend: {
// Optional: keep your brand palette here as semantic tokens
colors: {
brand: {
DEFAULT: "hsl(var(--brand))",
foreground: "hsl(var(--brand-foreground))",
},
},
borderRadius: {
xl: "calc(var(--radius) + 2px)",
},
},
},
plugins: [],
};


export default config;