import { useRef, useState } from "react";
import FontSizeAdjuster from "./FontSizeAdjuster";
import ThemeToggle from "./ThemeToggle";
import BackToTop from "./BackToTop";
import { Button } from "@components/ui/button";
import { motion, useDragControls } from "framer-motion";

export default function FloatingTools() {
  const [expanded, setExpanded] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const isDraggingRef = useRef(false);

  const dragControls = useDragControls();

  function startDrag(event: React.PointerEvent) {
    const target = event.target as HTMLElement;
    if (target.closest(".menu-items-container")) return;
    dragControls.start(event);
  }

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-50"
    >
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={true}
        whileDrag={{ scale: 1.3 }}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 50);
        }}
        className="absolute bottom-6 right-6 pointer-events-auto flex flex-col-reverse items-center gap-3 [font-size:16px_!important] touch-none"
      >
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full shadow-md border border-input bg-background text-foreground hover:scale-115 hover:bg-accent active:scale-85 transition-all duration-200 select-none"
          onPointerDown={startDrag}
          onClick={() => {
            if (isDraggingRef.current) return;
            setExpanded((prev) => !prev);
          }}
        >
          <span
            className={`text-xl transition-transform duration-200 block ${expanded ? "rotate-45" : "rotate-0"}`}
          >
            +
          </span>
        </Button>

        <div
          className={`flex flex-col gap-3 transition-all duration-200 ${
            expanded
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-10 opacity-0 pointer-events-none"
          }`}
        >
          <BackToTop />
          <ThemeToggle />
          <FontSizeAdjuster />
        </div>
      </motion.div>
    </div>
  );
}
