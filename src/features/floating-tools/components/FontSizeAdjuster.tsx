import { useState, useEffect, useRef } from "react";
import { Slider } from "@components/ui/slider";
import { Button } from "@components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@components/ui/popover";

export default function FontSizeAdjuster() {
  // 延迟初始化
  const [fontsize, setFontsize] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fontSize");
      return saved ? parseInt(saved, 10) : 100;
    }
    return 100;
  });

  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const [isSpinning, setIsSpinning] = useState(false);

  function handleTriggerSpin() {
    if (isSpinning) return;
    setIsSpinning((prev) => !prev);
  }

  useEffect(() => {
    // 如果已经有一个定时器存在，就清空并开启新的定时器
    if (timeRef.current) clearTimeout(timeRef.current);

    timeRef.current = setTimeout(() => {
      document.documentElement.style.fontSize = `${fontsize}%`;
      localStorage.setItem("fontSize", fontsize.toString());
    }, 100);

    return () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
    };
  }, [fontsize]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleTriggerSpin}
          onAnimationEnd={() => setIsSpinning(false)}
          className="h-11 w-11 rounded-full shadow-md border border-input bg-background transition-all duration-200 hover:scale-115 active:scale-85 text-foreground hover:bg-accent relative overflow-hidden group"
        >
          <span
            className={`absolute inset-0 bg-[conic-gradient(from_0deg,transparent_30%,#3b82f6_70%,#a855f7_100%)] z-0 transition-opacity duration-300 
              ${isSpinning ? "opacity-100 animate-[spin_0.3s_linear_infinite]" : "opacity-0 group-hover:opacity-90 animate-[spin_3s_linear_infinite]"}`}
          />

          <span className="absolute inset-px bg-background/80 backdrop-blur-md rounded-full z-10" />

          <span
            className={`relative z-10 block
              ${isSpinning ? "animate-[spin_0.5s_ease-out_1] scale-125 transition-transform duration-200" : ""}`}
          >
            A
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="left"
        align="center"
        className="w-52 p-0 bg-popover/80 backdrop-blur-md text-popover-foreground shadow-xl border border-input rounded-xl transition-all"
      >
        <div className="flex justify-between items-center px-4 py-2.5 border-b border-border/40 bg-muted/20">
          <span className="text-xs font-medium text-muted-foreground">
            字号
          </span>
          <span className="bg-accent px-1.5 py-0.5 rounded font-mono text-[11px] text-foreground shadow-sm">
            {fontsize}%
          </span>
        </div>

        <div className="p-4 bg-muted/10">
          <Slider
            min={60}
            max={130}
            step={1}
            onValueChange={(val) => setFontsize(val[0])}
            value={[fontsize]}
            className="cursor-pointer py-1"
          />

          <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-2 font-sans px-0.5">
            <span>缩小</span>
            <span>放大</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
