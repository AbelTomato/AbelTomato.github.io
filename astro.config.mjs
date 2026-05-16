// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import mermaid from "mdx-mermaid";

// https://astro.build/config
export default defineConfig({
  site: "https://AbelTomato.github.io",
  base: "/",
  integrations: [
    mdx({
      remarkPlugins: [[mermaid, { output: "svg", theme: "dark" }]],
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
    ],
    shikiConfig: {
      theme: "github-dark",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
