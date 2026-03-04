import fs from "fs";
import axios from "axios";

const dataDir = "./src/data";
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

async function sync() {
  const API_KEY = process.env.WAKATIME_API_KEY;
  if (!API_KEY) {
    console.error("❌ API_KEY");
    process.exit(1);
  }
  const token = Buffer.from(API_KEY).toString("base64");

  // 计算日期：WakaTime summaries 接口需要明确的 start 和 end
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 89); // 包含今天在内的 90 天

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const url = `https://wakatime.com/api/v1/users/current/summaries?start=${startStr}&end=${endStr}`;

  try {
    console.log(`📡 正在抓取从 ${startStr} 到 ${endStr} 的数据...`);
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${token}` },
    });

    const allDays = response.data.data;

    // 1. 提取最近 7 天（用于柱状图）
    const weekly = allDays.slice(-7).map((day) => ({
      date: day.range.date,
      seconds: day.grand_total.total_seconds,
      text: day.grand_total.text,
    }));

    // 2. 提取热力图数据
    const heatmap = allDays.map((day) => ({
      date: day.range.date,
      seconds: day.grand_total.total_seconds,
    }));

    // 3. 统计语言分布（最近 90 天累加）
    const langMap = {};
    allDays.forEach((day) => {
      day.languages.forEach((l) => {
        langMap[l.name] = (langMap[l.name] || 0) + l.total_seconds;
      });
    });
    const languages = Object.entries(langMap)
      .map(([name, sec]) => ({ name, total_seconds: sec }))
      .sort((a, b) => b.total_seconds - a.total_seconds)
      .slice(0, 6);

    const processedData = {
      total: response.data.cumulative_total.text,
      daily_average: response.data.daily_average.text,
      weekly,
      heatmap,
      languages,
    };

    fs.writeFileSync(
      `${dataDir}/wakatime.json`,
      JSON.stringify(processedData, null, 2),
    );
    console.log("✅ 90天数据全量同步成功！");
  } catch (error) {
    // 如果还报错，看看是不是权限没开
    if (error.response?.status === 403) {
      console.error(
        "❌ 403 权限拒绝！请在 WakaTime Settings 检查 API Key 是否允许读取 Summaries。",
      );
    } else {
      console.error("❌ 报错:", error.response?.data || error.message);
    }
    process.exit(1);
  }
}
sync();
