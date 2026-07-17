import {
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Slider } from "@components/ui/slider";
import { LyricsPanel } from "./LyricsPanel";
import { Playlist } from "./Playlist";
import { TrackHeader } from "./TrackHeader";
import { useMusicPlayer } from "../hooks/useMusicPlayer";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function MusicSection() {
  const player = useMusicPlayer();

  return (
    <section aria-labelledby="music-heading" className="space-y-5">
      <div>
        <h2 id="music-heading" className="flex items-center gap-2 text-2xl font-bold">
          <ListMusic className="size-6 text-primary" aria-hidden="true" />
          Music
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">倾听内心的声音</p>
      </div>
      <Card className="overflow-hidden rounded-xl border-border/60 bg-card/70 p-5 text-card-foreground shadow-lg shadow-primary/5 backdrop-blur-xl">
        <audio
          ref={player.audioRef}
          src={player.audioSrc}
          onTimeUpdate={(event) => player.setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => player.setDuration(event.currentTarget.duration)}
          onPlay={() => player.setIsPlaying(true)}
          onPause={() => player.setIsPlaying(false)}
          onEnded={() => player.changeTrack(1)}
          onError={() => player.setAudioError("当前音频无法加载，请检查资源文件。")}
        />
        <TrackHeader coverSrc={player.coverSrc} isPlaying={player.isPlaying} track={player.activeTrack} />
        <div className="mt-6 border-y border-border/60 py-4">
          <LyricsPanel currentTime={player.currentTime} source={player.lyricsSource} title={player.activeTrack.title} />
        </div>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs text-muted-foreground">
              <span>{formatTime(player.currentTime)}</span>
              <span>-{formatTime(Math.max(player.duration - player.currentTime, 0))}</span>
            </div>
            <Slider aria-label="播放进度" className="[&_[data-slot=slider-range]]:bg-primary" value={[player.currentTime]} min={0} max={Math.max(player.duration, 1)} step={1} disabled={!player.hasAudio} onValueChange={([nextTime]) => player.seek(nextTime)} />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
            <div className="flex justify-end"><Button variant="ghost" size="icon" className="rounded-full text-foreground hover:bg-muted hover:text-foreground" aria-label="上一首" onClick={() => player.changeTrack(-1)}><SkipBack /></Button></div>
            <Button size="icon-lg" className="size-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" aria-label={player.isPlaying ? "暂停" : "播放"} onClick={player.togglePlayback}>
              {player.isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
            </Button>
            <div className="flex min-w-0 items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:bg-muted hover:text-foreground" aria-label="下一首" onClick={() => player.changeTrack(1)}><SkipForward /></Button>
              <div className="ml-auto flex min-w-0 items-center gap-2">
                {player.volume === 0 ? <VolumeX className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : <Volume2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                <Slider aria-label="音量" className="hidden h-5 w-20 shrink-0 sm:flex sm:w-28 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-muted-foreground/35 [&_[data-slot=slider-range]]:h-2 [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-4" value={[player.volume]} min={0} max={100} step={1} onValueChange={([volume]) => player.setVolume(volume)} />
              </div>
            </div>
          </div>
        </div>
        {player.audioError ? <p className="mt-4 text-xs text-destructive">{player.audioError}</p> : null}
        {!player.hasAudio && !player.audioError ? <p className="mt-4 text-xs text-muted-foreground">音频资源待添加至 <code>assets/audio</code>。</p> : null}
      </Card>
      <Playlist activeIndex={player.activeIndex} isPlaying={player.isPlaying} onSelect={player.selectTrack} />
    </section>
  );
}