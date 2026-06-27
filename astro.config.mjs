// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeCodeBlocks from "./src/utils/rehypeCodeBlocks.ts";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://abel-tomato-github-io.vercel.app",
  base: "/",
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeCodeBlocks],
    }),
    sitemap(),
    react(),
  ],

  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [
        rehypeKatex,
        {
          strict: false,
          throwOnError: false,
        },
      ],
      rehypeCodeBlocks,
    ],
    shikiConfig: {
      theme: "github-dark",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
