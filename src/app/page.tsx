import Desktop from "@/components/Desktop";
import { getPosts } from "@/lib/posts";

export default function Home() {
  // 服务端读 Markdown，客户端桌面拿到的是已经渲染好的 HTML
  const posts = getPosts();

  return <Desktop posts={posts} />;
}
