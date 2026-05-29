import { Credential, LeetCodeCN } from "leetcode-query";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const LEETCODE_SESSION = process.env.LEETCODE_SESSION;
const USERNAME = "AbelTomato"; // 苗哥的 LeetCode 账号
const TARGET_DIR = "src/features/leetcode-stats/data";
const FILE_PATH = path.join(TARGET_DIR, "leetcode.json");

if (!LEETCODE_SESSION) {
  console.error("❌ 错误：未在 .env 中检测到 LEETCODE_SESSION，拒绝抓取！");
  process.exit(1);
}

// 定义下基本的类型结构（防止你写 TS 报错）
interface ProgressQuestion {
  translatedTitle: string;
  frontendId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  lastSubmittedAt: string;
  numSubmitted: number;
  questionStatus: string;
  lastResult: string;
  topicTags: Array<{ name: string; nameTranslated: string; slug: string }>;
}

async function getData() {
  const credential = new Credential();
  await credential.init(LEETCODE_SESSION);
  const lc = new LeetCodeCN(credential);

  try {
    console.log("开始增量抓取 LeetCode 数据...");

    let localData: any = null;
    let lastSyncTime = 0;

    if (fs.existsSync(FILE_PATH)) {
      try {
        const rawJson = fs.readFileSync(FILE_PATH, "utf-8");
        localData = JSON.parse(rawJson);
        const oldQuestions: ProgressQuestion[] =
          localData?.userProgressQuestionList?.questions || [];

        if (oldQuestions.length > 0) {
          lastSyncTime = new Date(oldQuestions[0].lastSubmittedAt).getTime();
          console.log(
            `检测到本地历史数据，最新题目同步点为: ${oldQuestions[0].lastSubmittedAt}`,
          );
        }
      } catch (e) {
        console.warn("读取本地 json 失败或格式损坏，将切换为全量抓取。");
      }
    }

    const [userProfile, contestInfo, recentSubmissions] = await Promise.all([
      lc.user(USERNAME),
      lc.user_contest_info(USERNAME),
      lc.recent_submissions(USERNAME),
    ]);

    let newlyFetchedQuestions: ProgressQuestion[] = [];
    let skip = 0;
    const limit = 20;
    let hasMore = true;

    console.log("正在向服务器获取新题目...");
    while (hasMore) {
      const progressPage = await lc.user_progress_questions({ skip, limit });
      const questions: ProgressQuestion[] = progressPage?.questions || [];

      if (questions.length === 0) {
        hasMore = false;
        break;
      }

      let hitCheckpoint = false;

      for (const q of questions) {
        const currentQTime = new Date(q.lastSubmittedAt).getTime();

        if (lastSyncTime && currentQTime <= lastSyncTime) {
          console.log(
            `成功命中同步点。题目 [${q.frontendId}.${q.title}] 及之后的题目本地已存在。`,
          );
          hitCheckpoint = true;
          break;
        }

        newlyFetchedQuestions.push(q);
      }

      if (hitCheckpoint || questions.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }
    }

    console.log(
      `增量抓取完成，本次捕获到 ${newlyFetchedQuestions.length} 道新题。`,
    );

    let finalQuestionsList: ProgressQuestion[] = [];
    if (localData?.userProgressQuestionList?.questions) {
      finalQuestionsList = [
        ...newlyFetchedQuestions,
        ...localData.userProgressQuestionList.questions,
      ];
    } else {
      finalQuestionsList = newlyFetchedQuestions;
    }

    const publicProfile = userProfile.userProfilePublicProfile;
    const finalData = {
      userProfileQuestionProgress: userProfile.userProfileUserQuestionProgress,
      skillSet: publicProfile.profile.skillSet,
      userContestRanking: contestInfo.userContestRanking,
      userContestRankingHistory: contestInfo.userContestRankingHistory,
      recentSubmission: recentSubmissions,
      userProgressQuestionList: {
        totalNum: finalQuestionsList.length,
        questions: finalQuestionsList,
      },
    };

    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    fs.writeFileSync(FILE_PATH, JSON.stringify(finalData, null, 2), "utf-8");
    console.log(`数据已写入 ${FILE_PATH}`);
  } catch (error) {
    console.error("增量更新脚本异常：", error);
  }
}

getData();
