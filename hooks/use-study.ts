"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { mergeEvents, type StudyEvent } from "../lib/study";
import { validEvent } from "../lib/validation";
const KEY = "loop-test3-v1";
type Cache = { events: StudyEvent[]; pending: StudyEvent[] };
export function useStudy() {
  const [authorized, setAuthorized] = useState(false),
    [checking, setChecking] = useState(true),
    [events, setEvents] = useState<StudyEvent[]>([]),
    [sync, setSync] = useState("正在連接"),
    [pendingCount, setPendingCount] = useState(0);
  const cache = useRef<Cache>({ events: [], pending: [] }),
    busy = useRef(false),
    alive = useRef(true);
  const publish = useCallback(() => {
    if (!alive.current) return;
    setEvents([...cache.current.events]);
    setPendingCount(cache.current.pending.length);
    try {
      localStorage.setItem(KEY, JSON.stringify(cache.current));
    } catch {
      setSync("本機儲存空間不足，請保持連線同步");
    }
  }, []);
  const flush = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      while (cache.current.pending.length) {
        const batch = cache.current.pending.slice(0, 80);
        const r = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events: batch }),
          signal: AbortSignal.timeout(12000),
        });
        if (r.status === 401) {
          setAuthorized(false);
          throw new Error("請重新輸入 PIN");
        }
        if (!r.ok) throw new Error("暫未同步，本機紀錄已保留");
        const result = (await r.json()) as { accepted: string[] };
        const accepted = new Set(result.accepted);
        cache.current.pending = cache.current.pending.filter(
          (e) => !accepted.has(e.id),
        );
        publish();
      }
      const r = await fetch("/api/events", {
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });
      if (r.status === 401) {
        setAuthorized(false);
        throw new Error("請重新輸入 PIN");
      }
      if (!r.ok) throw new Error("暫未同步，本機紀錄已保留");
      const result = (await r.json()) as { events: unknown[] };
      const remote = Array.isArray(result.events)
        ? result.events.filter((e: unknown) => validEvent(e))
        : [];
      cache.current.events = mergeEvents(cache.current.events, remote);
      publish();
      setSync("已同步");
    } catch (error) {
      setSync(
        !navigator.onLine
          ? "離線 · 恢復連線後同步"
          : error instanceof Error
            ? error.message
            : "暫未同步",
      );
    } finally {
      busy.current = false;
    }
  }, [publish]);
  useEffect(() => {
    alive.current = true;
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      cache.current = {
        events: (saved.events || []).filter((e: unknown) => validEvent(e)),
        pending: (saved.pending || []).filter((e: unknown) => validEvent(e)),
      };
      publish();
    } catch {
      setSync("無法讀取本機快取");
    }
    fetch("/api/session", {
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    })
      .then(async (r) => (await r.json()) as { authenticated?: boolean })
      .then((r) => {
        if (alive.current) {
          setAuthorized(!!r.authenticated);
          setSync(r.authenticated ? "連接進度中" : "輸入PIN開始");
        }
      })
      .catch(() => setSync("連線未完成，可再試登入"))
      .finally(() => setChecking(false));
    return () => {
      alive.current = false;
    };
  }, [publish]);
  useEffect(() => {
    if (!authorized) return;
    void flush();
    const timer = setInterval(() => void flush(), 30000);
    const refresh = () => {
      if (document.visibilityState === "visible") void flush();
    };
    const storage = (event: StorageEvent) => {
      if (event.key !== KEY || !event.newValue) return;
      try {
        const other = JSON.parse(event.newValue);
        cache.current.events = mergeEvents(
          cache.current.events,
          (other.events || []).filter((e: unknown) => validEvent(e)),
        );
        cache.current.pending = mergeEvents(
          cache.current.pending,
          (other.pending || []).filter((e: unknown) => validEvent(e)),
        );
        setEvents([...cache.current.events]);
        void flush();
      } catch {}
    };
    window.addEventListener("online", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [authorized, flush]);
  const record = useCallback(
    (entry: Omit<StudyEvent, "id" | "at">) => {
      const event = { ...entry, id: crypto.randomUUID(), at: Date.now() };
      cache.current.events = mergeEvents(cache.current.events, [event]);
      cache.current.pending = mergeEvents(cache.current.pending, [event]);
      publish();
      setSync("正在儲存");
      void flush();
    },
    [flush, publish],
  );
  async function login(pin: string) {
    const r = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
      signal: AbortSignal.timeout(12000),
    });
    const body = (await r.json()) as { error?: string };
    if (!r.ok) throw new Error(body.error || "未能登入");
    setAuthorized(true);
  }
  async function logout() {
    const r = await fetch("/api/session", { method: "DELETE" });
    if (!r.ok) throw new Error("未能鎖定，請再試");
    setAuthorized(false);
  }
  function backup() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            events: cache.current.events,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "loop-study-progress.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
  return {
    authorized,
    checking,
    events,
    sync,
    pendingCount,
    record,
    login,
    logout,
    refresh: flush,
    backup,
  };
}
