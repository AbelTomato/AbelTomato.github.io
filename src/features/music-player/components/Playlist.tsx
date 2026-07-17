import { Play, Volume2 } from "lucide-react";
import { musicTracks } from "../data/tracks";

type PlaylistProps = { activeIndex: number; isPlaying: boolean; onSelect: (index: number) => void };

export function Playlist({ activeIndex, isPlaying, onSelect }: PlaylistProps) {
  return <div className="rounded-xl border border-border/60 bg-card/70 p-2 shadow-sm shadow-primary/5 backdrop-blur-xl"><p className="px-3 pb-2 pt-1 text-xs font-medium text-muted-foreground">播放列表</p><div className="music-scrollbar-hidden max-h-60 space-y-1 overflow-auto pr-1">{musicTracks.map((track, index) => { const isActive = index === activeIndex; return <button key={track.id} type="button" className={`flex w-full min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${isActive ? "bg-primary/15 text-primary" : "hover:bg-muted/70"}`} onClick={() => onSelect(index)}><span className="w-5 shrink-0 text-center font-mono text-xs text-muted-foreground">{isActive && isPlaying ? <Volume2 className="mx-auto size-3.5" aria-label="正在播放" /> : String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{track.title}</span><span className="block truncate text-xs text-muted-foreground">{track.artist}</span></span><Play className="size-4 shrink-0" aria-hidden="true" /></button>; })}</div></div>;
}