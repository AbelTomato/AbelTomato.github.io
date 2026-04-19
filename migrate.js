import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_SRC = path.join(__dirname, "src/content/blog");
const IMAGE_SRC = path.join(__dirname, "src/assets/Contents/Blogs/HeroImages");

async function migrate() {
  try {
    const files = await fs.readdir(BLOG_SRC);
    const mdFiles = files.filter(
      (file) => file.endsWith(".md") || file.endsWith(".mdx"),
    );

    for (const file of mdFiles) {
      const fileNameWithoutExt = path.parse(file).name;

      const newDir = path.join(BLOG_SRC, fileNameWithoutExt);
      await fs.mkdir(newDir, { recursive: true });

      const oldMdPath = path.join(BLOG_SRC, file);
      const newMdPath = path.join(newDir, "index.md");
      let content = await fs.readFile(oldMdPath, "utf-8");

      const imageFileName = `${fileNameWithoutExt}heroImage.jpg`;
      const oldImagePath = path.join(IMAGE_SRC, imageFileName);
      const newImagePath = path.join(newDir, "hero.jpg");

      try {
        await fs.access(oldImagePath);
        await fs.copyFile(oldImagePath, newImagePath);
        console.log(`成功搬迁：${fileNameWithoutExt}`);

        content = content.replace(/!\[.*?\]\(.*?\)/g, (match) => {
          return match.replace(/\(.*\)/, "(./hero.jpg)");
        });
      } catch (e) {
        console.log(`未找到图片：${imageFileName},跳过图片处理`);
      }

      await fs.writeFile(newMdPath, content);
      await fs.unlink(oldMdPath);
    }

    console.log("搬迁完成！");
  } catch (err) {
    console.error("ops！", err);
  }
}

migrate();
