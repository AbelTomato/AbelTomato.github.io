import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { carouselCovers } from "../data/covers";
import { InfiniteSlider } from "./InfiniteSlider";

/**
 * 预加载图片
 */
function preloadImage(src: string): Promise<void> {
  if (!src || typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

/**
 * 批量预加载封面图片
 */
function preloadCarouselImages(covers: Array<{ src: string }>) {
  if (typeof window === "undefined" || covers.length === 0) return;

  // 使用 requestIdleCallback 在浏览器空闲时预加载
  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void) => void;
  };

  const loadImages = () => {
    const batchSize = 3;
    let currentIndex = 0;

    const loadBatch = () => {
      const batch = covers.slice(currentIndex, currentIndex + batchSize);
      if (batch.length === 0) return;

      Promise.all(batch.map((cover) => preloadImage(cover.src))).then(() => {
        currentIndex += batchSize;
        if (currentIndex < covers.length) {
          if (idleWindow.requestIdleCallback) {
            idleWindow.requestIdleCallback(loadBatch);
          } else {
            setTimeout(loadBatch, 100);
          }
        }
      });
    };

    loadBatch();
  };

  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(loadImages);
  } else {
    setTimeout(loadImages, 200);
  }
}

export function EchoCarousel() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 预加载所有封面图片
  useEffect(() => {
    preloadCarouselImages(carouselCovers);
  }, []);

  return (
    <section aria-label="封面轮播" className="py-4">
      <InfiniteSlider gap={24} speed={120} speedOnHover={20}>
        {carouselCovers.map((cover, index) => (
          <motion.img
            key={cover.alt}
            src={cover.src}
            alt={cover.alt}
            draggable={false}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            animate={{
              scale: hoveredIndex === index ? 1.05 : 1,
              y: hoveredIndex === index ? -5 : 0,
              filter:
                hoveredIndex !== null && hoveredIndex !== index
                  ? "blur(2px) brightness(0.65)"
                  : "blur(0px) brightness(1)",
              boxShadow:
                hoveredIndex === index
                  ? "0 10px 28px rgba(147, 112, 219, 0.55), 0 0 18px rgba(144, 202, 249, 0.4)"
                  : "0 0 12px rgba(139, 92, 246, 0.22)",
            }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
            className="aspect-square w-24 rounded-[4px] object-cover select-none sm:w-[120px]"
          />
        ))}
      </InfiniteSlider>
    </section>
  );
}
