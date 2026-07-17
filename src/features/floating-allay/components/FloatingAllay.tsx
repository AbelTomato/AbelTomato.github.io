import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";

const ALLAY_IMAGE_PATH = "/image/allay/乐魂动态.webp";

export default function FloatingAllay() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleClick = () => {
    if (isDragging) return;

    const distance = 80 + Math.random() * 80;
    const angle = Math.random() * Math.PI * 2;
    const maxX = 64;
    const maxY = 48;
    const minX = -(window.innerWidth - 144);
    const minY = -(window.innerHeight - 144);
    const targetX = Math.min(
      maxX,
      Math.max(minX, x.get() + Math.cos(angle) * distance),
    );
    const targetY = Math.min(
      maxY,
      Math.max(minY, y.get() + Math.sin(angle) * distance),
    );

    animate(x, targetX, { duration: 0.55, ease: "easeOut" });
    animate(y, targetY, { duration: 0.55, ease: "easeOut" });
  };

  return (
    <div
      ref={constraintsRef}
      aria-label="可拖拽的小乐魂"
      className="pointer-events-none fixed inset-0 z-[60]"
    >
      <motion.button
        type="button"
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.08}
        dragMomentum={false}
        style={{ x, y }}
        whileDrag={{ scale: 1.08, cursor: "grabbing" }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => window.setTimeout(() => setIsDragging(false), 80)}
        onClick={handleClick}
        className="pointer-events-auto absolute bottom-6 right-24 block touch-none cursor-grab select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:bottom-8 sm:right-28"
        aria-label="小乐魂，点击互动，拖拽移动"
      >
        <motion.span
          animate={
            prefersReducedMotion
              ? undefined
              : { y: [0, -10, 0], rotate: [0, -2, 2, 0] }
          }
          transition={
            { duration: 3.6, ease: "easeInOut", repeat: Infinity }
          }
          className="block"
        >
          <img
            src={ALLAY_IMAGE_PATH}
            alt="Minecraft 小乐魂"
            width={112}
            height={112}
            draggable={false}
            className="h-20 w-20 object-contain drop-shadow-[0_8px_10px_rgb(0_0_0_/_0.28)] sm:h-28 sm:w-28"
          />
        </motion.span>
      </motion.button>
    </div>
  );
}