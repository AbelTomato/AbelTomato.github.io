import { Button } from "@components/ui/button";
import { useState } from "react";

export default function BackToTop() {
  const [isClicking, setIsClicking] = useState(false);

  function handleToTop() {
    if (isClicking) return;
    setIsClicking(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setIsClicking(false);
    }, 450);
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-11 w-11 rounded-full shadow-md border bg-background text-foreground transition-all duration-200 hover:scale-115 active:scale-85 hover:bg-accent relative overflow-hidden group"
      onClick={handleToTop}
    >
      <style>{`
        @keyframes shuttleUp {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          40% {
            transform: translateY(-25px);
            opacity: 0;
          }
          41% {
            transform: translateY(25px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-shuttle {
          animation: shuttleUp 0.15s ease-in-out infinite;
        }
      `}</style>

      <span
        className={`absolute inset-0 bg-[conic-gradient(from_0deg,transparent_30%,#10b981_70%,#3b82f6_100%)] z-0 transition-opacity duration-300 
          ${isClicking ? "opacity-100 animate-[spin_0.3s_linear_infinite]" : "opacity-0 group-hover:opacity-90 animate-[spin_4s_linear_infinite]"}`}
      />

      <span className="absolute inset-px bg-background/80 backdrop-blur-md rounded-full z-10" />

      <span
        className={`relative z-10 block text-lg font-bold
          ${isClicking ? "animate-shuttle" : "group-hover:-translate-y-0.5 transition-transform duration-200"}`}
      >
        ↑
      </span>
    </Button>
  );
}
