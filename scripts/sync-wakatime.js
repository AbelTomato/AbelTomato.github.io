import fs from "fs";
import axios from "axios";

const dataDir = "./src/features/waka/data";
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

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 39);
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const url = `https://wakatime.com/api/v1/users/current/summaries?start=${startStr}&end=${endStr}`;

  try {
    console.log(`正在同步 ${startStr} 至 ${endStr} 的增量数据...`);
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${token}` },
    });

    const newDays = response.data.data;

    // 1. 初始化/读取旧数据
    let existingData = {
      lastUpdate: "",
      stats: {},
      total: "0h",
      daily_average: "0h",
      weekly: [],
      heatmap: [], // 存储格式：[{date, seconds}]
      languages: [], // 存储格式：[{name, total_seconds}]
      daily_languages: {},
    };

    if (fs.existsSync(filePath)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        existingData = { ...existingData, ...fileContent };
      } catch (e) {
        console.warn("旧JSON解析失败，启动初始化模式");
      }
    }

    const heatmapMap = new Map(
      existingData.heatmap.map((d) => [d.date, d.seconds]),
    );

    const dailyLangMap = existingData.daily_languages || {};

    newDays.forEach((day) => {
      const date = day.range.date;

      // 更新热力图数据
      heatmapMap.set(date, day.grand_total.total_seconds);

      const dayLangs = {};
      day.languages.forEach((l) => {
        dayLangs[l.name] = l.total_seconds;
      });
      dailyLangMap[date] = dayLangs;
    });

    const totalLangMap = {};
    Object.values(dailyLangMap).forEach((dayObj) => {
      Object.entries(dayObj).forEach(([name, sec]) => {
        totalLangMap[name] = (totalLangMap[name] || 0) + sec;
      });
    });

    // 5. 格式化最终数据
    const finalHeatmap = Array.from(heatmapMap.entries())
      .map(([date, seconds]) => ({ date, seconds }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const finalLanguages = Object.entries(totalLangMap)
      .map(([name, total_seconds]) => ({ name, total_seconds }))
      .filter((l) => !BLACKLIST.includes(l.name)) // 只在最终结果里过滤，不影响存储
      .sort((a, b) => b.total_seconds - a.total_seconds);

    // 6. 计算 Stats (基于 finalHeatmap)
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

    const processedData = {
      lastUpdate: now.toISOString(),
      total: response.data.cumulative_total.text,
      daily_average: response.data.daily_average.text,
      stats: {
        last_7_days: getStatsForDays(7),
        last_30_days: getStatsForDays(30),
        last_365_days: getStatsForDays(365),
        all_time: getStatsForDays(99999),
      },
      weekly: newDays.slice(-7).map((day) => ({
        date: day.range.date,
        seconds: day.grand_total.total_seconds,
        text: day.grand_total.text,
      })),
      heatmap: finalHeatmap,
      languages: finalLanguages,
      daily_languages: dailyLangMap, // 持久化每日详情，方便下次增量
    };

    fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2));
    console.log(
      `✅ 增量同步完成！目前已累积 ${finalHeatmap.length} 天的历史数据。`,
    );
  } catch (error) {
    console.error("❌ 错误：", error.response?.data || error.message);
    process.exit(1);
  }
}

sync();
