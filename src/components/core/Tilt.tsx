import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { PointerEvent, ReactNode } from "react";

interface TiltProps {
  children: ReactNode;
  rotationFactor?: number;
  isReverse?: boolean;
  className?: string;
}

export function Tilt({
  children,
  rotationFactor = 8,
  isReverse = false,
  className,
}: TiltProps) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springConfig = { stiffness: 220, damping: 24, mass: 0.5 };
  const springX = useSpring(pointerX, springConfig);
  const springY = useSpring(pointerY, springConfig);
  const direction = isReverse ? -1 : 1;
  const rotateX = useTransform(
    springY,
    [0, 1],
    [rotationFactor * direction, -rotationFactor * direction],
  );
  const rotateY = useTransform(
    springX,
    [0, 1],
    [-rotationFactor * direction, rotationFactor * direction],
  );

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  }

  function resetTilt() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  return (
    <div
      className={className}
      style={{ perspective: 1000 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <motion.div
        className="motion-reduce:transform-none [backface-visibility:hidden]"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}