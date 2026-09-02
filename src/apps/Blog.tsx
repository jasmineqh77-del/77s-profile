"use client";

import { useState } from "react";

import { usePostsStore } from "@/os/postsStore";

import blogStyles from "./Blog.module.css";
import styles from "./apps.module.css";

export default function Blog() {
  const posts = usePostsStore((s) => s.posts);
  const [activeSlug, setActiveSlug] = useState<string | null>(posts[0]?.slug ?? null);

  if (posts.length === 0) {
    return (
      <div className={styles.page}>
        <p className={styles.headline}>No posts yet</p>
        <p className={styles.paragraph}>
          Drop a <code>.md</code> file into <code>content/posts/</code> and it shows up here.
        </p>
      </div>
    );
  }

  const active = posts.find((p) => p.slug === activeSlug) ?? posts[0];

  return (
    <div className={blogStyles.layout}>
      <ul className={blogStyles.sidebar}>
        {posts.map((post) => (
          <li key={post.slug}>
            <button
              type="button"
              className={`chrome-button ${blogStyles.sidebarItem} ${
                post.slug === active.slug ? blogStyles.sidebarItemActive : ""
              }`}
              onClick={() => setActiveSlug(post.slug)}
            >
              <span className={blogStyles.postTitle}>{post.title}</span>
              <span className={blogStyles.postDate}>{post.date}</span>
            </button>
          </li>
        ))}
      </ul>

      <article className={blogStyles.reader}>
        <h1 className={blogStyles.readerTitle}>{active.title}</h1>
        <p className={blogStyles.readerDate}>{active.date}</p>
        <div
          className={blogStyles.prose}
          // 文章都是自己写的本地 Markdown，没有外部输入
          dangerouslySetInnerHTML={{ __html: active.html }}
        />
      </article>
    </div>
  );
}
