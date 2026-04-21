import { type ImageMetadata } from "astro";

const avatarImages = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/avatars/*.{jpg,png}",
  { eager: true },
);
const coverImages = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/covers/*.{jpg,png}",
  { eager: true },
);

export interface Friend {
  name: string;
  description: string;
  url: string;
  avatar: ImageMetadata;
  cover: ImageMetadata;
}

const getImg = (
  map: Record<string, { default: ImageMetadata }>,
  name: string,
) => {
  const path = Object.keys(map).find((p) => p.includes(name));
  if (!path) throw new Error(`找不到图片：${name}`);
  return map[path].default;
};

export const friendsList: Friend[] = [
  {
    name: "Misuzu0010",
    description: "SZTU传奇galgame王，怀揣游戏开发梦之人，深圳一条区",
    url: "https://misuzu0010.github.io/",
    avatar: getImg(avatarImages, "lpl"),
    cover: getImg(coverImages, "lpl"),
  },
  {
    name: "Coast",
    description: "软件学社学长，算法竞赛大佬",
    url: "https://coast23.github.io",
    avatar: getImg(avatarImages, "coast"),
    cover: getImg(coverImages, "coast"),
  },
  {
    name: "无止境",
    description: "软件学社学长，走客户端和Android开发",
    url: "https://baakarshan.github.io/",
    avatar: getImg(avatarImages, "wzj"),
    cover: getImg(coverImages, "wzj"),
  },
  {
    name: "Linjer",
    description: "软工学长，因对算法的热情而相聚",
    url: "https://xmu-linjer.vercel.app/",
    avatar: getImg(avatarImages, "linjer"),
    cover: getImg(coverImages, "linjer"),
  },
  {
    name: "两只鸽子",
    description: "学社同级同学，聚焦于深度学习和开发",
    url: "https://hatoya-doublepigeonblog.pages.dev/",
    avatar: getImg(avatarImages, "hatoya"),
    cover: getImg(coverImages, "hatoya"),
  },
  {
    name: "Slient-Sure",
    description: "学社转到计科的学长，同样算法竞赛大佬",
    url: "https://silent-sure.github.io/",
    avatar: getImg(avatarImages, "jyt"),
    cover: getImg(coverImages, "jyt"),
  },
];
