import fs from "fs";
import axios from "axios";

const dataDir = "./src/data";
const filePath = `${dataDir}/wakatime.json`;
const BLACKLIST = ["Other", "Text"];

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

async function sync() {
  const API_KEY = process.env.WAKATIME_API_KEY;
  if (!API_KEY) {
    console.error("❌ API_KEY错误");
    process.exit(1);
  }
  const token = Buffer.from(API_KEY).toString("base64");

  const endDate = new Date(); //抓取过去90天的数据
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 32);
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const url = `https://wakatime.com/api/v1/users/current/summaries?start=${startStr}&end=${endStr}`;

  try {
    console.log(`正在同步 ${startStr} 至 ${endStr} 的数据...`);
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${token}` },
    });

    const allDays = response.data.data;

    // 读取并合并旧数据
    let existingData = {
      total: "0h",
      daily_average: "0h",
      weekly: [],
      heatmap: [],
      languages: [],
    };
    if (fs.existsSync(filePath)) {
      try {
        existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        console.warn("旧json格式错误，准备重建");
      }
    }

    // 处理热力图数据：按日期去重
    const newHeatmap = allDays.map((day) => ({
      date: day.range.date,
      seconds: day.grand_total.total_seconds,
    }));

    const heatmapMap = new Map();
    (existingData.heatmap || []).forEach((d) => heatmapMap.set(d.date, d));
    newHeatmap.forEach((d) => heatmapMap.set(d.date, d));

    // 转回数组并排序
    const finalHeatmap = Array.from(heatmapMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    //处理语言
    const langMap = {};
    allDays.forEach((day) => {
      day.languages.forEach((l) => {
        if (!BLACKLIST.includes(l.name)) {
          langMap[l.name] = (langMap[l.name] || 0) + l.total_seconds;
        }
      });
    });
    const languages = Object.entries(langMap)
      .map(([name, sec]) => ({ name, total_seconds: sec }))
      .sort((a, b) => b.total_seconds - a.total_seconds);

    const now = new Date();

    const getStatsForDays = (days) => {
      const cutoff = new Date();
      cutoff.setDate(now.getDate() - days);

      const filtered = finalHeatmap.filter((d) => new Date(d.date) >= cutoff);
      const totalSeconds = filtered.reduce((acc, cur) => acc + cur.seconds, 0);

      return {
        total_seconds: totalSeconds,
        total_text: `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`,
        days_active: filtered.filter((d) => d.seconds > 0).length,
      };
    };

    const stats = {
      last_7_days: getStatsForDays(7),
      last_30_days: getStatsForDays(30),
      last_365_days: getStatsForDays(365),
    };

    const processedData = {
      lastUpdate: now.toISOString(),
      stats,
      total: response.data.cumulative_total.text,
      daily_average: response.data.daily_average.text,
      weekly: allDays.slice(-7).map((day) => ({
        date: day.range.date,
        seconds: day.grand_total.total_seconds,
        text: day.grand_total.text,
      })),
      heatmap: finalHeatmap,
      languages: languages,
    };

    fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2));
    console.log(`✅ 目前已累积 ${finalHeatmap.length} 天的数据。`);
  } catch (error) {
    console.error("❌ 错误：", error.response?.data || error.message);
    process.exit(1);
  }
}
sync();
