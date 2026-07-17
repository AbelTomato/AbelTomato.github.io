import { useEffect, useRef, useState } from "react";
import { musicTracks } from "../data/tracks";
import { getTrackAssets } from "../utils/musicAssets";

const noAudioMessage = "请先将音频文件放入 music-player/assets/audio 目录。";
const playbackErrorMessage = "当前音频无法播放，请检查资源文件。";

export function useMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [audioError, setAudioError] = useState("");
  const activeTrack = musicTracks[activeIndex]!;
  const { audioSrc, coverSrc, lyricsSource } = getTrackAssets(activeTrack);
  const hasAudio = Boolean(audioSrc);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setAudioError("");
    if (isPlaying && audioSrc) {
      void audio.play().catch(() => {
        setIsPlaying(false);
        setAudioError(playbackErrorMessage);
      });
    }
  }, [activeTrack.id, audioSrc]);

  const selectTrack = (index: number) => {
    setActiveIndex(index);
    setIsPlaying(true);
  };
  const changeTrack = (offset: number) => {
    selectTrack((activeIndex + offset + musicTracks.length) % musicTracks.length);
  };
  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) {
      setAudioError(noAudioMessage);
      return;
    }
    if (audio.paused) {
      void audio.play().catch(() => setAudioError(playbackErrorMessage));
    } else {
      audio.pause();
    }
  };
  const seek = (nextTime: number) => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return {
    activeIndex,
    activeTrack,
    audioError,
    audioRef,
    audioSrc,
    changeTrack,
    coverSrc,
    currentTime,
    duration,
    hasAudio,
    isPlaying,
    lyricsSource,
    seek,
    selectTrack,
    setAudioError,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setVolume,
    togglePlayback,
    volume,
  };
}