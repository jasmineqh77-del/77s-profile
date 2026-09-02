import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { getRedis, REDIS_KEYS } from "@/lib/redis";

export const runtime = "nodejs";

const COOKIE_NAME = "visitor_counted";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

async function readCount(redis: NonNullable<ReturnType<typeof getRedis>>) {
  const raw = await redis.get<number | string>(REDIS_KEYS.visits);
  const n = typeof raw === "number" ? raw : Number(raw ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Visitor counter is offline. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN." },
      { status: 503 },
    );
  }

  try {
    const count = await readCount(redis);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Could not read visit count." }, { status: 500 });
  }
}

export async function POST() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Visitor counter is offline. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN." },
      { status: 503 },
    );
  }

  try {
    const jar = await cookies();
    const already = jar.get(COOKIE_NAME)?.value;

    if (already) {
      const count = await readCount(redis);
      return NextResponse.json({ count, counted: false });
    }

    // 有 cookie 库之外再挡一层：部分代理场景下 Set-Cookie 可能延迟，用 IP 短窗防连点
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";
    const burstKey = `visits:burst:${ip}`;
    const burst = await redis.incr(burstKey);
    if (burst === 1) {
      await redis.expire(burstKey, 10);
    }
    if (burst > 3) {
      const count = await readCount(redis);
      return NextResponse.json({ count, counted: false });
    }

    const count = await redis.incr(REDIS_KEYS.visits);
    const res = NextResponse.json({ count, counted: true });
    res.cookies.set(COOKIE_NAME, "1", {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Could not update visit count." }, { status: 500 });
  }
}
