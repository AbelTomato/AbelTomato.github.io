// src/utils/readingTime.ts

/**
 *
 * @param content
 */

export function getReadingStats(content: string) {
  // 匹配中文、英文单词（忽略标点符号）

  if (!content)
    return {
      count: 0,
      minutes: 0,
    };

  const cleanContent = content.replace(/---[\s\S]*?---/, "");
  const chineseChars = cleanContent.match(/[\u4e00-\u9fa5]/g) || [];
  const englishWords = cleanContent.match(/[a-zA-Z0-9_]+/g) || [];

  const count = chineseChars.length + englishWords.length;
  const minutes = Math.ceil(count / 200);

  return {
    count,
    minutes,
  };
}
