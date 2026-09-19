import { motion } from "framer-motion";
import { useState } from "react";
import { InfiniteSlider } from "./InfiniteSlider";

interface Props {
  covers: Array<{ src: string; srcSet: string; alt: string }>;
}

export function EchoCarousel({ covers }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section aria-label="封面轮播" className="py-4">
      <InfiniteSlider gap={24} speed={120} speedOnHover={20}>
        {covers.map((cover, index) => (
          <motion.img
            key={cover.alt}
            src={cover.src}
            srcSet={cover.srcSet}
            sizes="(min-width: 640px) 128px, 101px"
            loading={index < 8 ? "eager" : "lazy"}
            decoding="async"
            width={120}
            height={120}
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
