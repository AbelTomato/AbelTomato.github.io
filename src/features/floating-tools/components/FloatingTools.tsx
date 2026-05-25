import { useState } from "react";
import FontSizeAdjuster from "./FontSizeAdjuster";
import ThemeToggle from "./ThemeToggle";
import BackToTop from "./BackToTop";
import { Button } from "@components/ui/button";

export default function FloatingTools() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-center gap-3 [font-size:16px_!important]">
      <Button
        variant="outline"
        size="icon"
        className="h-11 w-11 rounded-full shadow-md border border-input bg-background text-foreground hover:scale-115 hover:bg-accent active:scale-85 transition-all duration-200"
        onClick={() => setExpanded((prev) => !prev)}
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
    </div>
  );
}
