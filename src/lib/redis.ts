import { Redis } from "@upstash/redis";

/** 没配 Upstash env 时返回 null，API 自己报 503，别把整站搞挂。 */
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const REDIS_KEYS = {
  guestbook: "guestbook:entries",
  visits: "visits:count",
  guestbookRate: (ip: string) => `guestbook:rl:${ip}`,
} as const;
