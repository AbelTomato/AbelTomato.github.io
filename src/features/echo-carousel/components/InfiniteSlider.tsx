import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

type InfiniteSliderProps = {
  children: ReactNode;
  className?: string;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
};

export function InfiniteSlider({
  children,
  className = "",
  gap = 24,
  speed = 96,
  speedOnHover,
}: InfiniteSliderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [loopWidth, setLoopWidth] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);
  const currentSpeed = useRef(speed);
  const x = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  const items = Array.isArray(children) ? children : [children];

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const updateWidth = () => setLoopWidth(group.getBoundingClientRect().width);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(group);
    return () => observer.disconnect();
  }, [gap]);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || loopWidth === 0) return;

    const targetSpeed =
      isHovered && speedOnHover !== undefined ? speedOnHover : speed;
    const smoothing = 1 - Math.exp(-delta / 160);
    currentSpeed.current += (targetSpeed - currentSpeed.current) * smoothing;

    let nextX = x.get() - currentSpeed.current * (delta / 1000);
    if (nextX <= -loopWidth) nextX += loopWidth;
    x.set(nextX);
  });

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        <div
          ref={groupRef}
          className="flex shrink-0"
          style={{ gap, paddingRight: gap }}
        >
          {items}
        </div>
        <div
          className="flex shrink-0"
          style={{ gap, paddingRight: gap }}
          aria-hidden="true"
        >
          {items.map((item, index) => (
            <span key={index} className="contents">
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
