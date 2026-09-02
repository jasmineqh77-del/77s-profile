import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { guestbookSeed, type GuestbookEntry } from "@content/guestbookSeed";

import { getRedis, REDIS_KEYS } from "@/lib/redis";

export const runtime = "nodejs";

const MAX_ENTRIES = 50;
const MAX_HANDLE = 32;
const MAX_MESSAGE = 280;
const RATE_LIMIT = 3;
const RATE_WINDOW_SEC = 60;

function parseEntry(raw: unknown): GuestbookEntry | null {
  if (!raw) return null;
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || value === null) return null;
  const obj = value as Record<string, unknown>;
  if (
    typeof obj.id !== "string" ||
    typeof obj.handle !== "string" ||
    typeof obj.message !== "string" ||
    typeof obj.createdAt !== "string"
  ) {
    return null;
  }
  return {
    id: obj.id,
    handle: obj.handle,
    message: obj.message,
    createdAt: obj.createdAt,
  };
}

async function listEntries(
  redis: NonNullable<ReturnType<typeof getRedis>>,
): Promise<GuestbookEntry[]> {
  const raw = await redis.lrange(REDIS_KEYS.guestbook, 0, MAX_ENTRIES - 1);
  const entries: GuestbookEntry[] = [];
  for (const item of raw) {
    const parsed = parseEntry(item);
    if (parsed) entries.push(parsed);
  }
  return entries;
}

async function ensureSeed(redis: NonNullable<ReturnType<typeof getRedis>>) {
  const len = await redis.llen(REDIS_KEYS.guestbook);
  if (len > 0) return;
  // 种子按「新在上」写入：最后一条 seed 先 push，最终顺序与 guestbookSeed 一致
  for (let i = guestbookSeed.length - 1; i >= 0; i -= 1) {
    await redis.lpush(REDIS_KEYS.guestbook, JSON.stringify(guestbookSeed[i]));
  }
}

function clientIp(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Guestbook is offline. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN." },
      { status: 503 },
    );
  }

  try {
    await ensureSeed(redis);
    const entries = await listEntries(redis);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: "Could not load guestbook." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Guestbook is offline. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const handle = String((body as { handle?: unknown }).handle ?? "").trim();
  const message = String((body as { message?: unknown }).message ?? "").trim();

  if (!handle || !message) {
    return NextResponse.json({ error: "Handle and message are required." }, { status: 400 });
  }
  if (handle.length > MAX_HANDLE) {
    return NextResponse.json({ error: `Handle must be ≤ ${MAX_HANDLE} characters.` }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: `Message must be ≤ ${MAX_MESSAGE} characters.` },
      { status: 400 },
    );
  }

  try {
    const h = await headers();
    const ip = clientIp(h);
    const rateKey = REDIS_KEYS.guestbookRate(ip);
    const hits = await redis.incr(rateKey);
    if (hits === 1) {
      await redis.expire(rateKey, RATE_WINDOW_SEC);
    }
    if (hits > RATE_LIMIT) {
      return NextResponse.json(
        { error: "Too many messages. Try again in a minute." },
        { status: 429 },
      );
    }

    await ensureSeed(redis);

    const entry: GuestbookEntry = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      handle,
      message,
      createdAt: new Date().toISOString(),
    };

    await redis.lpush(REDIS_KEYS.guestbook, JSON.stringify(entry));
    await redis.ltrim(REDIS_KEYS.guestbook, 0, MAX_ENTRIES - 1);

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save message." }, { status: 500 });
  }
}
