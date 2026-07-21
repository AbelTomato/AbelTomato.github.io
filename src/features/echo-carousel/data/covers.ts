type ImageAsset = { src: string };

const assetModules = import.meta.glob<ImageAsset>("../assets/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  import: "default",
});

export const carouselCovers = Object.entries(assetModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "zh-CN"))
  .map(([path, image]) => {
    const filename = path.split("/").at(-1) ?? "轮播图片";

    return {
      src: image.src,
      alt: filename.replace(/\.[^.]+$/, "").replaceAll("-", " "),
    };
  });