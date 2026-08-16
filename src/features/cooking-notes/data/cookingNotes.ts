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
];
