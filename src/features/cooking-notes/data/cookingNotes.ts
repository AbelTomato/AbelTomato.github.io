export interface CookingNote {
  id: string;
  title: string;
  date: string;
  notes: string[];
  image?: string;
  imageAlt?: string;
}

export const cookingNotes: CookingNote[] = [
  {
    id: "peach-jam",
    title: "桃子果酱",
    date: "2026-08-16",
    notes: [
      "上次做完葡萄果酱还不赖，这次试一下桃子果酱",
      "主要就是家里买的水果除了西瓜我基本都不吃（",
      "现在知道了放玉米淀粉得先勾芡调个水淀粉，要不然直接放进锅里煮就成成块的面团了",
      "卖相有点一言难尽，貌似不应该直接放进榨汁机搅然后熬的，成果泥了",
    ],
    image: "桃子果酱.jpg",
  },
  {
    id: "2",
    title: "咖喱豆角白菜小米辣萝卜爆炒鸡胸肉",
    date: "2026-08-16",
    notes: [
      "其实不放咖喱之前看起来还比较正常（？",
      "说真的味道不赖，晚饭就着剩的包子和鸡蛋吃完了",
    ],
    image: "咖喱豆角白菜小米辣萝卜爆炒鸡胸肉.jpg",
  },
  {
    id: "3",
    title: "做饭给九个人吃",
    date: "2026-08-17",
    notes: [
      "头一次做这么多人的饭",
      "猪肉炖粉条得先把猪肉煎到冒油，这时候不用放油，总体还是比较简单的，很好吃的一道菜",
      "当然算少了，虽然有两个大菜，但是最后九个人五道菜还是不够",
    ],
    image: "九人餐.jpg",
  },
];
