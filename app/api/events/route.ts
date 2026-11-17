import { getDb } from "../../../db";
import { studyEvents } from "../../../db/schema";
import { authorized, reply, sameOrigin } from "../../../lib/auth";
import { validEvent } from "../../../lib/validation";
import { desc } from "drizzle-orm";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    if (!(await authorized(request))) return reply({ error: "請輸入PIN" }, 401);
    const rows = await getDb()
      .select()
      .from(studyEvents)
      .orderBy(desc(studyEvents.at))
      .limit(20000);
    // shortcut: sync returns the latest 20,000 events; add pagination if this desk exceeds that history.
    return reply({ events: rows.reverse() });
  } catch {
    return reply({ error: "同步暫時未能完成；本機紀錄會保留。" }, 503);
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Forbidden" }, 403);
  try {
    if (!(await authorized(request)))
      return reply({ error: "請重新輸入PIN" }, 401);
    if (Number(request.headers.get("content-length")) > 40000)
      return reply({ error: "資料過大" }, 413);
    const text = await request.text();
    if (text.length > 40000) return reply({ error: "資料過大" }, 413);
    const body = JSON.parse(text);
    if (
      !Array.isArray(body.events) ||
      body.events.length < 1 ||
      body.events.length > 100 ||
      !body.events.every((e: unknown) => validEvent(e))
    )
      return reply({ error: "紀錄格式不正確" }, 400);
    const clean = body.events.map((e: Record<string, unknown>) => ({
      id: e.id,
      kind: e.kind,
      qid: e.qid,
      moduleId: e.moduleId,
      at: e.at,
      correct: e.correct,
      assisted: e.assisted,
      self: e.self,
    }));
    await getDb().insert(studyEvents).values(clean).onConflictDoNothing();
    return reply({ accepted: body.events.map((e: { id: string }) => e.id) });
  } catch {
    return reply({ error: "同步暫時未能完成；本機紀錄會保留。" }, 503);
  }
}
