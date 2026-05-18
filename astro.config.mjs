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
      remarkPlugins: [
        remarkMath,
        [
          mermaid,
          {
            output: "svg",
            theme: "dark",
            mermaid: {
              themeVariables: {
                fontFamily:
                  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans CN", -apple-system, sans-serif',
              },
            },
          },
        ],
      ],
      rehypePlugins: [rehypeKatex],
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
