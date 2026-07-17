import { ListMusic } from "lucide-react";
import type { MusicTrack } from "../data/tracks";

type TrackHeaderProps = {
  coverSrc?: string;
  isPlaying: boolean;
  track: MusicTrack;
};

const visualizerBars = [12, 24, 18, 30, 16];

export function TrackHeader({ coverSrc, isPlaying, track }: TrackHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {coverSrc ? <img src={coverSrc} alt={`${track.album}封面`} className="size-16 shrink-0 rounded-xl object-cover shadow-md transition-transform hover:scale-105" /> : <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 to-blue-600 text-white shadow-md"><ListMusic className="size-7" aria-hidden="true" /></div>}
      <div className="min-w-0 flex-1"><p className="truncate text-lg font-semibold">{track.title}</p><p className="mt-0.5 truncate text-sm text-muted-foreground">{track.artist}</p></div>
      <div className="flex h-8 w-9 shrink-0 items-end justify-center gap-1" aria-label={isPlaying ? "正在播放" : "已暂停"}>
        {visualizerBars.map((height, index) => <span key={height} className={`music-wave-bar music-wave-bar-${index} w-1 rounded-full bg-primary ${isPlaying ? "music-wave-bar-playing" : ""}`} style={{ height }} />)}
      </div>
    </div>
  );
}