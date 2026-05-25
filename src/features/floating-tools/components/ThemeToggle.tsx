import { Button } from "@components/ui/button";
import { useEffect, useRef, useState } from "react";

export default function ThemeToggle() {
  // 设置一个默认初始值，不要在useState里读localStroage或者window！！服务器端没有这些东西
  const [isDark, setIsDark] = useState(false);

  // 组件初次挂载时，读取缓存或者系统偏好
  useEffect(() => {
    const localTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-theme: dark)",
    ).matches;

    const shouldBeDark =
      localTheme === "dark" || (!localTheme && systemPrefersDark);
    setIsDark(shouldBeDark);
  }, []);

  // isDark改变时同时修改当前页面的document和缓存内容
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-11 w-11 rounded-full shadow-md border bg-background text-foreground hover:bg-accent hover:scale-115 active:scale-85 transition-all duration-200 relative overflow-hidden group"
      onClick={() => setIsDark((prev) => !prev)}
    >
      <span
        className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_30%,#f43f5e_70%,#3b82f6_100%)] z-0
        opacity-0 group-hover:opacity-90 transition-opacity duration-300 animate-[spin_4s_linear_infinite]
        group-active:animate-[spin_0.4s_linear_infinite]"
      />

      <span className="absolute inset-px bg-background/80 backdrop-blur-md rounded-full z-10" />

      <span className="relative z-10 block w-6 h-6 overflow-hidden">
        <span
          className={`absolute inset-0 flex items-center justify-center text-xl transition-all duration-500 ease-out
            ${isDark ? "-translate-y-8 opacity-0 scale-50" : "translate-y-0 opacity-100 scale-100"}`}
        >
          ☀️
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center text-xl transition-all duration-500 ease-out
          ${isDark ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-50"}`}
        >
          🌙
        </span>
      </span>
    </Button>
  );
}
