export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  audioFile: string;
  coverFile: string;
  lyricsFile?: string;
};

// Add matching files under ../assets/audio and ../assets/covers to make tracks playable.
export const musicTracks: MusicTrack[] = [
  {
    id: "guo-yuan-chao",
    title: "郭源潮",
    artist: "宋冬野",
    album: "郭源潮",
    audioFile: "郭源潮.m4a",
    coverFile: "郭源潮.png",
  },
  {
    id: "memory-about-zhengzhou",
    title: "关于郑州的记忆",
    artist: "耿十三",
    album: "关于郑州的记忆。",
    audioFile: "关于郑州的记忆.mp3",
    coverFile: "关于郑州的记忆.png",
  },

  {
    id: "painting",
    title: "画",
    artist: "赵雷",
    album: "赵小雷",
    audioFile: "画.m4a",
    coverFile: "画.png",
  },
  {
    id: "old-boy",
    title: "老男孩",
    artist: "筷子兄弟",
    album: "父亲",
    audioFile: "老男孩.m4a",
    coverFile: "老男孩.png",
  },
  {
    id: "those-flowers",
    title: "那些花儿",
    artist: "朴树",
    album: "我去2000年",
    audioFile: "那些花儿.m4a",
    coverFile: "那些花儿.png",
    lyricsFile: "朴树 - 那些花儿.lrc",
  },
  {
    id: "south-girl",
    title: "南方姑娘",
    artist: "赵雷",
    album: "赵小雷",
    audioFile: "南方姑娘.m4a",
    coverFile: "南方姑娘.png",
  },
  {
    id: "kill-that-shijiazhuang-person",
    title: "杀死那个石家庄人",
    artist: "万能青年旅店",
    album: "万能青年旅店",
    audioFile: "杀死那个石家庄人.m4a",
    coverFile: "杀死那个石家庄人.png",
  },
  {
    id: "deep-sea",
    title: "深海",
    artist: "刘森",
    album: "华北浪革",
    audioFile: "深海.m4a",
    coverFile: "深海.png",
  },
  {
    id: "lanzhou-lanzhou",
    title: "兰州 兰州",
    artist: "低苦艾",
    album: "兰州 兰州",
    audioFile: "兰州 兰州.m4a",
    coverFile: "兰州 兰州.png",
  },
];
