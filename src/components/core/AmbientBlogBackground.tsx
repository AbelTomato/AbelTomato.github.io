import { motion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const beamPaths = [
  "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
  "M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827",
  "M-292 -285C-292 -285 -224 120 240 247C704 374 772 779 772 779",
  "M-248 -333C-248 -333 -180 72 284 199C748 326 816 731 816 731",
  "M-204 -381C-204 -381 -136 24 328 151C792 278 860 683 860 683",
  "M-160 -429C-160 -429 -92 -24 372 103C836 230 904 635 904 635",
  "M-116 -477C-116 -477 -48 -72 416 55C880 182 948 587 948 587",
  "M-72 -525C-72 -525 -4 -120 460 7C924 134 992 539 992 539",
  "M-28 -573C-28 -573 40 -168 504 -41C968 86 1036 491 1036 491",
  "M16 -621C16 -621 84 -216 548 -89C1012 38 1080 443 1080 443",
  "M38 -645C38 -645 106 -240 570 -113C1034 14 1102 419 1102 419",
];

const beamColors = [
  ["#22d3ee", "#38bdf8"],
  ["#38bdf8", "#60a5fa"],
  ["#2dd4bf", "#38bdf8"],
  ["#60a5fa", "#818cf8"],
  ["#67e8f9", "#2dd4bf"],
] as const;

interface Star {
  x: number;
  y: number;
  z: number;
  twinkleOffset: number;
}

interface Beam {
  colors: readonly [string, string];
  delay: number;
  duration: number;
  reverse: boolean;
  transform: string;
}

const randomBetween = (minimum: number, maximum: number) =>
  minimum + Math.random() * (maximum - minimum);

export default function AmbientBlogBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientPrefix = useId().replace(/:/g, "");
  const [reducedMotion, setReducedMotion] = useState(false);
  const beams = useMemo<Beam[]>(
    () =>
      beamPaths.map((_, index) => ({
        colors: beamColors[Math.floor(Math.random() * beamColors.length)],
        delay: randomBetween(0, 12),
        duration: randomBetween(12, 19),
        reverse: Math.random() > 0.5,
        transform: `rotate(${[0, 90, 180, 270][Math.floor(Math.random() * 4)]} 348 158)${Math.random() > 0.5 ? " translate(696 0) scale(-1 1)" : ""}`,
      })),
    [],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const maxDepth = 1200;
    const stars: Star[] = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let previousTime = 0;
    let paused = document.hidden || reducedMotion;

    const createStar = (): Star => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: randomBetween(80, maxDepth),
      twinkleOffset: randomBetween(0, Math.PI * 2),
    });

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      stars.splice(0, stars.length, ...Array.from({ length: 220 }, createStar));
    };

    const resetStar = (star: Star) => {
      star.x = (Math.random() - 0.5) * width * 2;
      star.y = (Math.random() - 0.5) * height * 2;
      star.z = maxDepth;
    };

    const drawStars = (timestamp: number, advance: boolean) => {
      context.clearRect(0, 0, width, height);
      const isDark = document.documentElement.classList.contains("dark");
      const baseAlpha = isDark ? 0.72 : 0.38;
      const color = isDark ? "205, 232, 255" : "71, 132, 181";

      for (const star of stars) {
        if (advance) {
          star.z -= 1.2;
          if (star.z <= 0) resetStar(star);
        }

        const scale = 360 / star.z;
        const x = width / 2 + star.x * scale;
        const y = height / 2 + star.y * scale;
        if (x < -3 || x > width + 3 || y < -3 || y > height + 3) continue;

        const depth = 1 - star.z / maxDepth;
        const opacity = (0.22 + depth * 0.68) * baseAlpha * (0.82 + Math.sin(timestamp * 0.001 + star.twinkleOffset) * 0.18);
        context.beginPath();
        context.arc(x, y, 0.6 + depth * 1.65, 0, Math.PI * 2);
        context.fillStyle = `rgba(${color}, ${opacity})`;
        context.fill();
      }
    };

    const render = (timestamp: number) => {
      frameId = requestAnimationFrame(render);
      if (paused || timestamp - previousTime < 42) return;
      previousTime = timestamp;
      drawStars(timestamp, true);
    };

    const visibilityChange = () => {
      paused = document.hidden || reducedMotion;
    };

    resize();
    if (reducedMotion) drawStars(0, false);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibilityChange);
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <svg className="absolute inset-0 h-full w-full opacity-70 dark:opacity-90" fill="none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 696 316">
        {!reducedMotion && beamPaths.map((path, index) => {
          const beam = beams[index];
          const gradientId = `${gradientPrefix}-${index}`;
          return (
            <motion.path
              animate={{ pathOffset: beam.reverse ? [1, 0] : [0, 1], opacity: [0, 0.48, 0.48, 0] }}
              d={path}
              initial={{ pathLength: 0.38, pathOffset: beam.reverse ? 1 : 0, opacity: 0 }}
              key={`beam-${index}`}
              stroke={`url(#${gradientId})`}
              strokeLinecap="round"
              strokeWidth="1.1"
              transition={{ delay: beam.delay, duration: beam.duration, ease: "linear", repeat: Infinity }}
              transform={beam.transform}
            />
          );
        })}
        <defs>
          {beams.map((beam, index) => (
            <linearGradient id={`${gradientPrefix}-${index}`} key={`gradient-${index}`} x1={beam.reverse ? "100%" : "0%"} x2={beam.reverse ? "0%" : "100%"} y1="0%" y2="100%">
              <stop offset="0%" stopColor={beam.colors[0]} stopOpacity="0" />
              <stop offset="16%" stopColor={beam.colors[0]} stopOpacity="0" />
              <stop offset="68%" stopColor={beam.colors[0]} stopOpacity="0.38" />
              <stop offset="86%" stopColor={beam.colors[1]} stopOpacity="1" />
              <stop offset="100%" stopColor={beam.colors[1]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
}