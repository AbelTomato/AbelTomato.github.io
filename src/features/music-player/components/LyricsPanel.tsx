import { useEffect, useMemo, useRef } from "react";
import { parseLrc } from "../utils/parseLrc";

type LyricsPanelProps = { currentTime: number; source?: string; title: string };

export function LyricsPanel({ currentTime, source, title }: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLParagraphElement>(null);
  const lyrics = useMemo(() => parseLrc(source ?? ""), [source]);
  const activeIndex = useMemo(
    () => lyrics.findLastIndex((line) => line.time <= currentTime),
    [currentTime, lyrics],
  );

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [title]);
  useEffect(() => {
    const container = containerRef.current;
    const activeLyric = activeLyricRef.current;
    if (!container || !activeLyric) return;
    container.scrollTo({
      top:
        activeLyric.offsetTop -
        container.offsetTop -
        (container.clientHeight - activeLyric.clientHeight) / 2,
      behavior: "smooth",
    });
  }, [activeIndex]);

  if (!lyrics.length)
    return (
      <div className="flex h-[72px] items-center justify-center text-sm text-muted-foreground">
        暂无歌词
      </div>
    );
  return (
    <div
      ref={containerRef}
      className="music-scrollbar-hidden h-[72px] overflow-auto scroll-smooth px-2 text-center"
      aria-label={`${title}歌词`}
    >
      <div className="flex flex-col py-6">
        {lyrics.map((line, index) => {
          const isActive = index === activeIndex;
          return (
            <p
              key={`${line.time}-${index}`}
              ref={isActive ? activeLyricRef : undefined}
              className={`min-h-6 text-sm leading-6 transition-all duration-300 ${isActive ? "scale-105 font-semibold text-primary" : "text-muted-foreground/60"}`}
            >
              {line.text || "..."}
            </p>
          );
        })}
      </div>
    </div>
  );
}
