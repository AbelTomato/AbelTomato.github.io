import type { MusicTrack } from "../data/tracks";

const audioAssets = import.meta.glob<{ default: string }>(
  "../assets/audio/*.{mp3,m4a,ogg,wav,flac}",
  { eager: true, query: "?url" },
);
const coverAssets = import.meta.glob<{ default: string }>(
  "../assets/covers/*.{jpg,jpeg,png,webp}",
  { eager: true, query: "?url" },
);
const lyricAssets = import.meta.glob<string>("../assets/lyrics/*.lrc", {
  eager: true,
  query: "?raw",
  import: "default",
});

export function getTrackAssets(track: MusicTrack) {
  const lyricsFile = track.lyricsFile ?? `${track.title}.lrc`;

  return {
    audioSrc: audioAssets[`../assets/audio/${track.audioFile}`]?.default,
    coverSrc: coverAssets[`../assets/covers/${track.coverFile}`]?.default,
    lyricsSource: lyricAssets[`../assets/lyrics/${lyricsFile}`],
  };
}