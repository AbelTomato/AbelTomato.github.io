import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

const assetModules = import.meta.glob<ImageMetadata>("../assets/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  import: "default",
});

// 128px 为 120px 卡片悬停放大预留余量，256/512px 覆盖高分屏。
// PNG 避免再次有损编码；资源处理仅在 Astro 构建端运行。
export const carouselCovers = await Promise.all(Object.entries(assetModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "zh-CN"))
  .map(async ([path, image]) => {
    const filename = path.split("/").at(-1) ?? "轮播图片";
    const widths = [...new Set([128, 256, 512].map((width) => Math.min(width, image.width)))];
    const variants = await Promise.all(widths.map(async (width) => ({
      width,
      image: await getImage({ src: image, width, format: "png" }),
    })));

    return {
      src: variants[0].image.src,
      srcSet: variants.map((variant) => `${variant.image.src} ${variant.width}w`).join(", "),
      alt: filename.replace(/\.[^.]+$/, "").replaceAll("-", " "),
    };
  }));