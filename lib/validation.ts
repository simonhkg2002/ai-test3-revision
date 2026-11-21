import { modules, questions } from "./course";
import type { StudyEvent } from "./study";
const owners = new Map(questions.map((q) => [q.id, q.moduleId]));
const lessonOwners = new Map<string, string>(modules.flatMap(m => m.lessons.flatMap((l, i) => l.check ? [[`${m.id}-lesson-v2-${i}`, m.id] as const] : [])));
const mids = new Set(modules.map((m) => m.id));
export function validEvent(
  value: unknown,
  now = Date.now(),
): value is StudyEvent {
  if (!value || typeof value !== "object") return false;
  const e = value as StudyEvent;
  return (
    typeof e.id === "string" &&
    /^[a-zA-Z0-9-]{16,64}$/.test(e.id) &&
    mids.has(e.moduleId) &&
    (e.kind === "read"
      ? e.qid === `${e.moduleId}-read`
      : e.kind === "answer" &&
        (owners.get(e.qid) === e.moduleId ||
          lessonOwners.get(e.qid) === e.moduleId ||
          e.qid === `${e.moduleId}-variant`)) &&
    typeof e.at === "number" &&
    Number.isSafeInteger(e.at) &&
    e.at > 1700000000000 &&
    e.at < now + 300000 &&
    typeof e.correct === "boolean" &&
    typeof e.assisted === "boolean" &&
    typeof e.self === "boolean"
  );
}
