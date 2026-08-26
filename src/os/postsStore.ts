"use client";

import { create } from "zustand";

import type { Post } from "@/lib/posts";

/**
 * 文章内容在服务端构建时读取，挂载时灌进这个 store，
 * 让客户端的博客窗口能直接拿到。
 */
type PostsStore = {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
};

export const usePostsStore = create<PostsStore>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
}));
