import { Button } from "@components/ui/button";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("light");
    }
    return false;
  });

  useEffect(() => {
    const syncThemeFromDOM = () => {
      setIsLight(document.documentElement.classList.contains("light"));
    };

    document.addEventListener("astro:after-swap", syncThemeFromDOM);
    return () =>
      document.removeEventListener("astro:after-swap", syncThemeFromDOM);
  }, []);

  const toggleTheme = () => {
    const newIsLight = !isLight;
    setIsLight(newIsLight);
    if (newIsLight) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-11 w-11 rounded-full shadow-md border bg-background text-foreground hover:bg-accent hover:scale-115 active:scale-85 transition-all duration-200 relative overflow-hidden group"
      onClick={toggleTheme}
    >
      <span className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_30%,#f43f5e_70%,#3b82f6_100%)] z-0 opacity-0 group-hover:opacity-90 transition-opacity duration-300 animate-[spin_4s_linear_infinite] group-active:animate-[spin_0.4s_linear_infinite]" />

      <span className="absolute inset-px bg-background/80 backdrop-blur-md rounded-full z-10" />

      <span className="relative z-10 block w-6 h-6 overflow-hidden">
        <span
          className={`absolute inset-0 flex items-center justify-center text-xl transition-all duration-500 ease-out ${
            isLight
              ? "translate-y-0 opacity-100 scale-100"
              : "-translate-y-8 opacity-0 scale-50"
          }`}
        >
          ☀️
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center text-xl transition-all duration-500 ease-out ${
            isLight
              ? "translate-y-8 opacity-0 scale-50"
              : "translate-y-0 opacity-100 scale-100"
          }`}
        >
          🌙
        </span>
      </span>
    </Button>
  );
}
