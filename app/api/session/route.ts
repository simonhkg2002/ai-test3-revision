import { env } from "cloudflare:workers";
import {
  authorized,
  sessionValue,
  sessionCookie,
  sameOrigin,
  reply,
} from "../../../lib/auth";
export const dynamic = "force-dynamic";
// shortcut: per-isolate throttling only; use a durable limiter if this simple personal desk attracts abuse.
const failures = new Map<string, { count: number; until: number }>();
export async function GET(request: Request) {
  try {
    return reply({ authenticated: await authorized(request) });
  } catch {
    return reply({ error: "暫時無法連接，請稍後再試。" }, 503);
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "請從網站內登入。" }, 403);
  if (Number(request.headers.get("content-length")) > 256)
    return reply({ error: "輸入過長" }, 413);
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const now = Date.now();
  const old = failures.get(ip);
  if (old && old.until > now && old.count >= 10)
    return reply({ error: "嘗試次數較多，請一分鐘後再試。" }, 429, {
      "Retry-After": "60",
    });
  try {
    const text = await request.text();
    if (text.length > 256) return reply({ error: "輸入過長" }, 413);
    const body = JSON.parse(text);
    if (!env.STUDY_PIN || !env.SESSION_SECRET)
      return reply({ error: "登入服務尚未準備好，請稍後再試。" }, 503);
    if (typeof body.pin !== "string" || body.pin !== env.STUDY_PIN) {
      if (failures.size > 1000) failures.clear();
      failures.set(ip, {
        count: old && old.until > now ? old.count + 1 : 1,
        until: now + 60000,
      });
      return reply({ error: "PIN 不正確，再試一次。" }, 401);
    }
    failures.delete(ip);
    return reply({ authenticated: true }, 200, {
      "Set-Cookie": sessionCookie(await sessionValue(), request),
    });
  } catch {
    return reply({ error: "無法登入，請檢查連線再試。" }, 400);
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Forbidden" }, 403);
  return reply({ authenticated: false }, 200, {
    "Set-Cookie": sessionCookie("", request, 0),
  });
}
