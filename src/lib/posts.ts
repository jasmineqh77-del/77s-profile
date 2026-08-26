import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  html: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

/**
 * 构建时读取 content/posts/*.md。
 * 只在服务端运行，结果由 page.tsx 作为 props 传给桌面。
 */
export function getPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, name), "utf8");
      const { data, content } = matter(raw);
      const slug = name.replace(/\.md$/, "");

      return {
        slug,
        title: typeof data.title === "string" ? data.title : slug,
        date: typeof data.date === "string" ? data.date : "",
        excerpt:
          typeof data.excerpt === "string"
            ? data.excerpt
            : content.trim().split("\n")[0]?.slice(0, 60) ?? "",
        html: marked.parse(content, { async: false }) as string,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
