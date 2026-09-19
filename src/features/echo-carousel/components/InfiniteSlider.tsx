import {
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

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
  const [loopWidth, setLoopWidth] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
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

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion || loopWidth === 0) return;
    let inView = false;
    let frame: number | undefined;
    let previousTime: number | undefined;

    const render = (time: number) => {
      const delta = previousTime === undefined ? 0 : Math.min(time - previousTime, 64);
      previousTime = time;
      const targetSpeed = hoveredRef.current && speedOnHover !== undefined ? speedOnHover : speed;
      const smoothing = 1 - Math.exp(-delta / 160);
      currentSpeed.current += (targetSpeed - currentSpeed.current) * smoothing;
      const nextX = x.get() - currentSpeed.current * (delta / 1000);
      x.set(((nextX % loopWidth) - loopWidth) % loopWidth);
      frame = requestAnimationFrame(render);
    };

    const update = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      previousTime = undefined;
      if (inView && !document.hidden) frame = requestAnimationFrame(render);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(root);
    document.addEventListener("visibilitychange", update);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [loopWidth, prefersReducedMotion, speed, speedOnHover, x]);

  return (
    <div
      ref={rootRef}
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
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
