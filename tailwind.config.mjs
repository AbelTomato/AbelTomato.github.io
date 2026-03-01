/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "selector", // 必须是字符串 'class'，不是数组
  theme: { extend: {} },
  plugins: [],
};
