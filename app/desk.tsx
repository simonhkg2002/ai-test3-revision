"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  RotateCcw,
  Check,
  LockKeyhole,
  BookOpen,
  Home,
  Layers,
  CalendarDays,
  Menu,
  X,
  Cloud,
  Search,
  Code2,
  Calculator,
  ChevronLeft,
  CheckCheck,
  Download,
} from "lucide-react";
import {
  modules,
  questions,
  kindName,
  type Module,
  type Lesson,
  type Question,
  type Kind,
} from "../lib/course";
import {
  DAY,
  hkDay,
  questionState,
  gradeNumbers,
  variant,
  type StudyEvent,
} from "../lib/study";
import { useStudy } from "../hooks/use-study";
type Session = {
  title: string;
  items: Question[];
  moduleId?: string;
  kind?: Kind;
};
const kinds: Kind[] = ["mc", "logic", "calc", "code"];
const quizIds = ["rnn", "rnn-shape", "lstm", "attention", "attention-matrix"];
const quizQuestions = questions.filter(q => quizIds.includes(q.moduleId) && !/GRU|Transformer/i.test(q.prompt));
const nav = [
  ["quiz", "11/25 考試專區", BookOpen],
  ["today", "今日", Home],
  ["learn", "學習路線", Layers],
  ["practice", "練習室", BookOpen],
  ["mistakes", "錯題本", RotateCcw],
  ["sheet", "公式速查", Calculator],
  ["plan", "七日計劃", CalendarDays],
] as const;
function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function fresh(q: Question): Question {
  if (q.id.endsWith("-variant"))
    return variant(q.moduleId, Math.floor(Math.random() * 1e9));
  if (!q.options) return q;
  const order = shuffle(q.options.map((_, i) => i));
  return {
    ...q,
    options: order.map((i) => q.options![i]),
    correct: order.indexOf(q.correct!),
  };
}
const variants = modules.map((m) => variant(m.id, 1));
const bank = [...questions, ...variants];
function Sources({ module }: { module: Module }) {
  return (
    <details className="sources">
      <summary>教材依據 · PDF 頁次</summary>
      <ul>
        {module.sources.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p>講解與練習為重新編寫。11/25 正式範圍為 RNN、LSTM、Attention；未取得考試評分準則。</p>
    </details>
  );
}
function LoopDiagram() {
  return (
    <svg
      className="loop-diagram"
      viewBox="0 0 260 190"
      role="img"
      aria-label="讀懂、試做、拆解、再練的循環"
    >
      <path
        d="M72 43C145-5 241 55 207 124S71 196 44 122S25 64 72 43"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />
      <path
        d="M64 35l13 5-6 13M219 117l-11 10-10-11M69 159l-12-6 7-12M37 68l-1-14 13 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {[
        [80, 39, "讀懂"],
        [207, 93, "試做"],
        [143, 160, "拆解"],
        [40, 111, "再練"],
      ].map(([x, y, label], i) => (
        <g key={i}>
          <circle
            cx={x as number}
            cy={y as number}
            r="23"
            fill="var(--paper)"
            stroke="currentColor"
          />
          <text
            x={x as number}
            y={(y as number) + 5}
            textAnchor="middle"
            fill="currentColor"
            fontSize="12"
          >
            {label}
          </text>
        </g>
      ))}
      <text
        x="130"
        y="103"
        textAnchor="middle"
        fill="currentColor"
        fontSize="29"
        fontFamily="Georgia"
      >
        ∞
      </text>
    </svg>
  );
}
function moduleStats(m: Module, events: StudyEvent[]) {
  const auto = questions.filter(
    (q) => q.moduleId === m.id && (q.type === "mc" || q.type === "calc"),
  );
  return {
    read: events.some((e) => e.kind === "read" && e.moduleId === m.id),
    correct: auto.filter((q) => {
      const last = questionState(q.id, events).last;
      return last?.correct && !last.assisted && !last.self;
    }).length,
    stable: auto.filter((q) => questionState(q.id, events).stable).length,
    total: auto.length,
  };
}
export default function Desk() {
  const study = useStudy();
  const [view, setView] = useState("quiz"),
    [mid, setMid] = useState(modules[0].id),
    [mobile, setMobile] = useState(false),
    [session, setSession] = useState<Session | null>(null),
    [pin, setPin] = useState(""),
    [loginError, setLoginError] = useState(""),
    [logging, setLogging] = useState(false),
    [search, setSearch] = useState(""),
    [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const media = matchMedia("(max-width:850px)");
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobile) return;
    document.querySelector<HTMLButtonElement>(".mobile-close")?.focus();
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobile(false);
        document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [mobile]);
  useEffect(() => {
    const load = () => {
      const [v, id] = location.hash.slice(1).split("/");
      if (nav.some((n) => n[0] === v)) {
        setView(v);
        if (modules.some((m) => m.id === id)) setMid(id);
        setSession(null);
        setMobile(false);
      }
    };
    load();
    window.addEventListener("hashchange", load);
    return () => window.removeEventListener("hashchange", load);
  }, []);
  function go(v: string, id?: string) {
    setSession(null);
    setView(v);
    if (id) setMid(id);
    setMobile(false);
    location.hash = v + (id ? "/" + id : "");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function start(s: Session) {
    if (!s.items.length) return;
    setSession({ ...s, items: s.items.map(fresh) });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const attempts = study.events.filter((e) => e.kind === "answer"),
    today = hkDay(Date.now()),
    todayAttempts = attempts.filter((e) => hkDay(e.at) === today),
    independent = attempts.filter((e) => !e.assisted && !e.self),
    states = bank.map((q) => ({ q, ...questionState(q.id, study.events) })),
    due = states.filter((s) => s.last && s.due <= Date.now()),
    misses = states.filter(
      (s) => s.last && (!s.last.correct || s.last.assisted),
    ),
    stable = states.filter((s) => s.stable).length;
  const recommended =
    modules.find((m) => {
      const s = moduleStats(m, study.events);
      return s.correct < s.total;
    }) || modules[0];
  function daily() {
    const priority = [
      ...states.filter((s) => s.last && !s.last.correct),
      ...due,
      ...shuffle(
        states.filter(
          (s) =>
            !s.last &&
            modules.indexOf(modules.find((m) => m.id === s.q.moduleId)!) <=
              modules.indexOf(recommended),
        ),
      ),
      ...shuffle(states.filter((s) => s.last)),
    ];
    const used = new Set<string>();
    const items = priority
      .map((s) => s.q)
      .filter((q) => !used.has(q.id) && !!used.add(q.id))
      .slice(0, 10);
    start({ title: `今日短練 · ${items.length} 題`, items });
  }
  async function enter(e: React.FormEvent) {
    e.preventDefault();
    setLogging(true);
    setLoginError("");
    try {
      await study.login(pin);
      setPin("");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "連線未完成，請再試。",
      );
    } finally {
      setLogging(false);
    }
  }
  if (!study.authorized)
    return (
      <main className="entrance">
        <div className="entrance-brand">
          <span className="wordmark">
            Loop<span className="brand-dot">.</span>
          </span>
          <span>COMP3057 / TEST 03</span>
        </div>
        <div className="entrance-grid">
          <section>
            <p className="eyebrow">A LITTLE, EVERY DAY</p>
            <h1>
              從「我不懂」，
              <br />
              到「我會了」。
            </h1>
            <p className="entrance-copy">
              一次一個小概念。
              <br />
              做一題、拆一步，再用新數字試一次。
              <br />
              這張桌，陪你從零開始。
            </p>
            <div className="entrance-loop">
              <LoopDiagram />
            </div>
          </section>
          <form className="pin-card" onSubmit={enter}>
            <span className="mini-label">
              <LockKeyhole size={16} /> YOUR STUDY DESK
            </span>
            <h2>打開你的溫習桌</h2>
            <p>
              手機、平板、電腦，同一進度。
              <br />
              輸入你的四位 PIN，接著上次繼續。
            </p>
            <label htmlFor="pin">四位數 PIN</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              autoComplete="off"
              required
              placeholder="· · · ·"
            />
            <p className="error" role="alert">
              {loginError}
            </p>
            <button
              className="primary wide"
              disabled={study.checking || logging}
            >
              {study.checking
                ? "正在連接…"
                : logging
                  ? "正在打開…"
                  : "開始今天的一小步"}
              <ArrowRight size={17} />
            </button>
            <small>
              共用一張學習桌。持有同一 PIN
              的裝置可接續同一份進度。課程與原創題目公開。
            </small>
          </form>
        </div>
        <footer>
          READ → TRY → UNDERSTAND → REPEAT <span>不用一次懂全部。</span>
        </footer>
      </main>
    );
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        跳到主要內容
      </a>
      <aside
        className={"sidebar " + (mobile ? "is-open" : "")}
        aria-label="導覽選單"
        inert={narrow && !mobile}
        aria-hidden={narrow && !mobile}
      >
        <div className="sidebar-brand">
          <button className="wordmark" onClick={() => go("today")}>
            Loop<span className="brand-dot">.</span>
          </button>
          <span>YOUR REVISION DESK</span>
          <button
            className="icon mobile-close"
            aria-label="關閉選單"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="course-stamp">
          <span>AI & MACHINE LEARNING</span>
          <strong>
            Test 03<span>COMP3057</span>
          </strong>
        </div>
        <nav aria-label="主選單">
          {nav.map(([id, label, Icon]) => (
            <button
              className={
                "nav-item " + (view === id && !session ? "active" : "")
              }
              key={id}
              onClick={() => go(id)}
            >
              <Icon size={18} />
              {label}
              {id === "mistakes" && misses.length > 0 && <b>{misses.length}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="tiny-orbit">↻</span>
          <p>
            看懂只是起點。
            <br />
            <strong>能自己做，才是你的。</strong>
          </p>
        </div>
        <div className="sidebar-bottom">
          <span className="edition">
            {modules.length} UNITS · {questions.length} QUESTIONS
            <br />+ 每單元可換數字的計算題
          </span>
          <button className="text-btn" onClick={study.backup}>
            <Download size={14} />
            匯出進度備份
          </button>
          <button
            className="text-btn"
            onClick={() => {
              void study.logout().catch((e) => alert(e.message));
            }}
          >
            <LockKeyhole size={14} />
            鎖定溫習桌
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="scrim"
          aria-label="關閉選單背景"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="workspace" inert={narrow && mobile}>
        <header className="topbar">
          <button
            className="icon menu-toggle"
            aria-label="開啟選單"
            onClick={() => setMobile(true)}
          >
            <Menu size={22} />
          </button>
          <span className="breadcrumb">
            COMP3057 <span>/</span>{" "}
            {session ? "練習中" : nav.find((n) => n[0] === view)?.[1]}
          </span>
          <button
            className={"sync " + (study.sync === "已同步" ? "synced" : "")}
            onClick={() => void study.refresh()}
            title="按此同步所有裝置"
          >
            <Cloud size={15} />
            <span aria-live="polite">
              {study.sync}
              {study.pendingCount > 0
                ? ` · ${study.pendingCount} 筆待同步`
                : ""}
            </span>
          </button>
        </header>
        <main id="main" className="content" tabIndex={-1}>
          {session ? (
            <PracticeSession
              key={
                JSON.stringify(session.items.map((q) => q.id)) + session.title
              }
              session={session}
              record={study.record}
              close={() => setSession(null)}
              next={(kind) => {
                const id = session.moduleId!;
                start({
                  title:
                    modules.find((m) => m.id === id)!.title +
                    " · " +
                    kindName[kind],
                  moduleId: id,
                  kind,
                  items: questions
                    .filter((q) => q.moduleId === id && q.type === kind)
                    .concat(kind === "calc" ? [variant(id, Date.now())] : []),
                });
              }}
            />
          ) : view === "quiz" ? (
            <QuizRevision start={start} />
          ) : view === "today" ? (
            <>
              <div className="page-heading">
                <p className="eyebrow">A LITTLE, EVERY DAY</p>
                <h1>
                  把不懂，拆成下一步<span className="green">。</span>
                </h1>
                <p>從零開始也可以。今天，只專心做好一小輪。</p>
              </div>
              <section className="focus-grid">
                <div className="focus-card">
                  <div className="section-line">
                    <span className="mini-label">YOUR NEXT SMALL STEP</span>
                    <span className="chip">
                      {recommended.foundation
                        ? "先補底，再向前"
                        : "Test 3 重點"}
                    </span>
                  </div>
                  <div className="focus-title">
                    <span className="unit-no">
                      {String(modules.indexOf(recommended) + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <div>
                      <h2>{recommended.title}</h2>
                      <p>{recommended.en}</p>
                    </div>
                  </div>
                  <p>{recommended.intro}</p>
                  <div className="focus-actions">
                    <button
                      className="primary"
                      onClick={() => go("learn", recommended.id)}
                    >
                      繼續學習 <ArrowRight size={17} />
                    </button>
                    <span>約 {recommended.minutes} 分鐘 · 一次一小節</span>
                  </div>
                  <div className="focus-footer">
                    <span>讀懂概念</span>
                    <i />
                    <span>選擇題</span>
                    <i />
                    <span>推理</span>
                    <i />
                    <span>計算與 code</span>
                  </div>
                </div>
                <div className="loop-card">
                  <p className="mini-label">UNDERSTANDING IS A LOOP</p>
                  <LoopDiagram />
                  <p>
                    不是做完一次。
                    <br />
                    <strong>是每次多懂一點。</strong>
                  </p>
                </div>
              </section>
              <div className="stats-grid">
                {[
                  [todayAttempts.length, "今日已練", "一題也是進步"],
                  [
                    independent.length
                      ? Math.round(
                          (independent.filter((e) => e.correct).length /
                            independent.length) *
                            100,
                        ) + "%"
                      : "—",
                    "獨立作答正確率",
                    "不含提示及自評",
                  ],
                  [due.length, "到期重溫", "讓記憶再碰一次"],
                  [stable, "穩定題目", "不同日期獨立答對2次"],
                ].map(([n, label, desc]) => (
                  <div className="stat" key={label}>
                    <span>{label}</span>
                    <strong>{n}</strong>
                    <small>{desc}</small>
                  </div>
                ))}
              </div>
              <section className="daily-strip">
                <div className="strip-icon">
                  <RotateCcw size={23} />
                </div>
                <div>
                  <h3>今天的一小輪</h3>
                  <p>優先找回錯題，再交錯練新題。每一題都有拆解。</p>
                </div>
                <button className="secondary" onClick={daily}>
                  開始一小輪 <ArrowUpRight size={17} />
                </button>
              </section>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">START WITH THE BASICS</p>
                  <h2>先把地基，慢慢打穩。</h2>
                </div>
                <button className="text-btn" onClick={() => go("learn")}>
                  完整路線 <ArrowRight size={16} />
                </button>
              </div>
              <div className="foundation-grid">
                {modules.slice(0, 4).map((m, i) => {
                  const s = moduleStats(m, study.events);
                  return (
                    <button
                      className="module-card"
                      key={m.id}
                      onClick={() => go("learn", m.id)}
                    >
                      <span className="mini-label">
                        FOUNDATION / 0{i + 1}
                        <ArrowUpRight size={17} />
                      </span>
                      <h3>{m.title}</h3>
                      <p>{m.en}</p>
                      <div className="bar">
                        <span
                          style={{ width: (s.correct / s.total) * 100 + "%" }}
                        />
                      </div>
                      <small>
                        獨立答對 {s.correct}/{s.total} ·{" "}
                        {s.read ? "讀過講解" : "從這裡開始"}
                      </small>
                    </button>
                  );
                })}
              </div>
              <div className="scope-note">
                <span className="scope-dot" />
                <p>
                  <strong>老師已確認範圍</strong>　11 月 25 日考 RNN、LSTM、Attention；本週 Transformer 架構不考。主選單「11/25 考試專區」只練本次範圍。
                </p>
              </div>
              <Weekly events={attempts} />
            </>
          ) : view === "learn" ? (
            <Learning
              selected={mid}
              events={study.events}
              choose={setMid}
              record={study.record}
              start={start}
            />
          ) : view === "practice" ? (
            <PracticeRoom events={study.events} start={start} daily={daily} />
          ) : view === "mistakes" ? (
            <>
              <PageTitle
                eyebrow="MISTAKES ARE YOUR MAP"
                title="錯的地方，就是下一步。"
                desc="這裡保留最近未答對、或依賴提示的題目。可以立即再練，也會進入重溫排程。"
              />
              <div className="section-heading">
                <h2>{misses.length} 題需要再碰一次</h2>
                {misses.length > 0 && (
                  <button
                    className="primary"
                    onClick={() =>
                      start({
                        title: "錯題重做",
                        items: shuffle(misses.map((s) => s.q)).slice(0, 12),
                      })
                    }
                  >
                    重做一輪 <RotateCcw size={16} />
                  </button>
                )}
              </div>
              {!misses.length ? (
                <div className="empty">
                  <CheckCheck size={35} />
                  <h3>
                    {attempts.length
                      ? "目前沒有待處理錯題"
                      : "先做一輪，這裡就有方向"}
                  </h3>
                  <p>答錯不是失敗。把錯誤找出來，才知道下一題練甚麼。</p>
                  <button className="secondary" onClick={daily}>
                    去練習
                  </button>
                </div>
              ) : (
                <div className="mistake-list">
                  {misses.map((s) => (
                    <article className="mistake-card" key={s.q.id}>
                      <div>
                        <span className="mini-label">
                          {modules.find((m) => m.id === s.q.moduleId)!.title} ·{" "}
                          {kindName[s.q.type]}
                        </span>
                        <h3>{s.q.prompt.split("\n")[0]}</h3>
                        <p>
                          {s.last?.assisted
                            ? "上次看過提示或答案"
                            : "上次未答對"}{" "}
                          ·{" "}
                          {s.due <= Date.now()
                            ? "現在可重溫"
                            : "可立即重做；排程稍後再提醒"}
                        </p>
                      </div>
                      <button
                        className="secondary"
                        onClick={() =>
                          start({ title: "把這一題拆懂", items: [s.q] })
                        }
                      >
                        再試一次 <ArrowRight size={16} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : view === "sheet" ? (
            <>
              <PageTitle
                eyebrow="YOUR OPEN-BOOK COMPANION"
                title="公式不是拿來硬背的。"
                desc="先知道每個符號在做甚麼，再回到閉卷練習。這裡供查閱，不計作掌握。"
              />
              <label className="search">
                <Search size={18} />
                <input
                  aria-label="搜尋公式或概念"
                  placeholder="搜尋 RNN、softmax、shape…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <div className="sheet-grid">
                {modules
                  .filter((m) =>
                    (m.title + m.en + m.formula.join(" "))
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((m) => (
                    <article className="sheet-card" key={m.id}>
                      <span className="mini-label">{m.en}</span>
                      <h2>{m.title}</h2>
                      {m.formula.map((f) => (
                        <pre className="formula" key={f}>
                          {f}
                        </pre>
                      ))}
                      <button
                        className="text-btn"
                        onClick={() => go("learn", m.id)}
                      >
                        看解說與例題 <ArrowRight size={15} />
                      </button>
                    </article>
                  ))}
              </div>
            </>
          ) : (
            <Plan go={go} start={start} />
          )}
          {!session && (
            <footer className="page-footer">
              <span>Loop / 每次一小步，理解會累積。</span>
              <span>繁中講解 · 英文術語 · 原創練習</span>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
function QuizRevision({ start }: { start: (s: Session) => void }) {
  const selected = modules.filter(m => quizIds.includes(m.id));
  return <>
    <PageTitle eyebrow="NOVEMBER 25 · WEDNESDAY" title="這次考試，專心讀這裡。" desc="老師已確認：RNN、LSTM、Attention。本週 Transformer 架構不考。" />
    <section className="quiz-banner">
      <h2>由例子開始，再自己做一次</h2>
      <p>先讀 RNN，接住 LSTM，最後 Attention。每節展開都有例子、逐步解釋同易錯位。以下練習只抽本次範圍，舊進度與錯題紀錄繼續保留。</p>
      <button className="primary" onClick={() => {
        const items = ["rnn", "lstm", "attention"].flatMap(topic => {
          const ids = topic === "rnn" ? ["rnn", "rnn-shape"] : topic === "attention" ? ["attention", "attention-matrix"] : ["lstm"];
          return kinds.flatMap(kind => shuffle(quizQuestions.filter(q => ids.includes(q.moduleId) && q.type === kind)).slice(0,1));
        });
        start({ title: "11/25 範圍小測 · 12 題", items: shuffle(items) });
      }}>開始本次範圍小測</button>
      <p className="quiz-note">原創練習，唔係老師試卷；短答及程式題按參考答案自評。GRU、Transformer 架構留喺完整課程，不納入呢個專區。</p>
    </section>
    <div className="quiz-sections">{selected.map(m => <section className="quiz-unit" key={m.id}>
      <h2>{m.title}</h2><p>{m.en}</p>
      {m.lessons.filter(l => !/GRU/i.test(l.title)).map(l => <details className="quiz-lesson" key={l.title}>
        <summary>{l.title}</summary>
        <h3>先看例子</h3><pre>{l.example}</pre>
        <p>{l.body}</p><ol>{l.steps.map((step,i) => <li key={i}>{step}</li>)}</ol>
        <p><strong>容易混淆：</strong>{l.trap}</p>
      </details>)}
      <div className="quiz-actions">{kinds.map(kind => <button className="secondary" key={kind} onClick={() => start({title: `11/25 · ${m.title} · ${kindName[kind]}`,items: quizQuestions.filter(q => q.moduleId === m.id && q.type === kind)})}>{kindName[kind]}</button>)}</div>
      <Sources module={m} />
    </section>)}</div>
    <section className="quiz-banner"><h2>考前自己講得出嗎？</h2><ul>
      <li>RNN：h_t 點樣由 x_t 同 h_(t−1) 更新？點解時間步共用參數？</li>
      <li>LSTM：forget／input／output gate 各自控制乜？c_t 同 h_t 有咩分別？</li>
      <li>Attention：Q 同 K 計分，softmax 求權重，再加權 V；矩陣 shape 同計算次序係乜？</li>
    </ul><p>補底內容仍喺「學習路線」，完整題庫仍喺「練習室」。本專區按 2026 年 11 月 21 日收到嘅老師公告整理。</p></section>
  </>;
}

function PageTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{desc}</p>
    </div>
  );
}
function Weekly({ events }: { events: StudyEvent[] }) {
  const days = Array.from({ length: 7 }, (_, i) => Date.now() - (6 - i) * DAY);
  return (
    <section className="weekly">
      <div>
        <span className="mini-label">SHOWING UP COUNTS</span>
        <h3>留下七天的小腳印</h3>
        <p>記錄有練習的日子，毋須連續全對。</p>
      </div>
      <div className="week-days">
        {days.map((t) => {
          const n = events.filter((e) => hkDay(e.at) === hkDay(t)).length;
          return (
            <div key={t} title={`${hkDay(t)} · ${n} 題`}>
              <span className={n ? "did" : ""}>
                {n ? <Check size={18} /> : "·"}
              </span>
              <small>{hkDay(t).slice(5)}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
function Learning({
  selected,
  events,
  choose,
  record,
  start,
}: {
  selected: string;
  events: StudyEvent[];
  choose: (id: string) => void;
  record: ReturnType<typeof useStudy>["record"];
  start: (s: Session) => void;
}) {
  const [lesson, setLesson] = useState(0);
  const m = modules.find((m) => m.id === selected) || modules[0],
    idx = modules.indexOf(m),
    s = moduleStats(m, events);
  useEffect(() => setLesson(0), [selected]);
  function chooseUnit(id: string) {
    choose(id);
    location.hash = "learn/" + id;
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function practice(kind: Kind) {
    start({
      title: m.title + " · " + kindName[kind],
      moduleId: m.id,
      kind,
      items: questions
        .filter((q) => q.moduleId === m.id && q.type === kind)
        .concat(kind === "calc" ? [variant(m.id, Date.now())] : []),
    });
  }
  const l = m.lessons[lesson] || m.lessons[0];
  return (
    <>
      <PageTitle
        eyebrow="YOUR LEARNING PATH"
        title="一個概念，一步一步。"
        desc="建議由 01 開始。先看一個示範，再親手試；不懂便回到上一小步。"
      />
      <div className="learning-layout">
        <nav className="unit-list" aria-label="選擇單元">
          {modules.map((unit, i) => (
            <div key={unit.id}>
              {(i === 0 || i === 4) && (
                <p className="mini-label">
                  {i === 0 ? "PART I / 從零補底" : "PART II / CNN 之後"}
                </p>
              )}
              <button
                className={unit.id === m.id ? "selected" : ""}
                onClick={() => chooseUnit(unit.id)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{unit.title}</strong>
                  <small>
                    {moduleStats(unit, events).correct}/
                    {moduleStats(unit, events).total} 獨立答對
                  </small>
                </div>
                {moduleStats(unit, events).stable ===
                  moduleStats(unit, events).total && <Check size={14} />}
              </button>
            </div>
          ))}
        </nav>
        <article className="lesson-panel">
          <div className="lesson-kicker">
            <span>
              UNIT {String(idx + 1).padStart(2, "0")} / {m.en}
            </span>
            <span className="chip">{m.foundation ? "補底" : "重點"}</span>
          </div>
          <h2>{m.title}</h2>
          <p className="lesson-intro">{m.intro}</p>
          <div className="learning-steps">
            <span className="current">1 概念</span>
            {kinds.map((k, i) => (
              <button key={k} onClick={() => practice(k)}>
                {i + 2} {kindName[k]}
              </button>
            ))}
          </div>
          <div className="lesson-tabs" aria-label="小節">
            {m.lessons.map((l, i) => (
              <button
                key={l.title}
                aria-label={`小節 ${i + 1}：${l.title}`}
                aria-current={i === lesson ? "step" : undefined}
                onClick={() => setLesson(i)}
              >
                {i + 1}
                <span>{l.title}</span>
              </button>
            ))}
          </div>
          <div className="lesson-body">
            <p className="mini-label">
              CONCEPT {lesson + 1} / {m.lessons.length}
            </p>
            <h3>{l.title}</h3>
            <div className="worked">
              <span className="mini-label">先看一個例子 / EXAMPLE FIRST</span>
              <h4>{l.example}</h4>
              {l.visual && <ExampleTable visual={l.visual} />}
              <ol>
                {l.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="concept-name">
              <h4>把例子連到名稱</h4>
              <p>{l.body}</p>
            </div>
            {l.check && <MiniCheck key={m.id + lesson} check={l.check} />}
            <aside className="trap">
              <strong>容易混淆的地方</strong>
              <p>{l.trap}</p>
            </aside>
          </div>
          <div className="lesson-bottom">
            <button
              className="text-btn"
              disabled={lesson === 0}
              onClick={() => setLesson(lesson - 1)}
            >
              <ChevronLeft size={16} />
              上一小節
            </button>
            {lesson < m.lessons.length - 1 ? (
              <button
                className="primary"
                onClick={() => {
                  setLesson(lesson + 1);
                  document
                    .querySelector(".lesson-panel")
                    ?.scrollIntoView({ block: "start" });
                }}
              >
                下一小節 <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="primary"
                onClick={() => {
                  if (!s.read)
                    record({
                      kind: "read",
                      qid: m.id + "-read",
                      moduleId: m.id,
                      correct: true,
                      assisted: false,
                      self: true,
                    });
                  practice("mc");
                }}
              >
                讀過了，試 3 題 MC <ArrowRight size={16} />
              </button>
            )}
          </div>
          <div className="unit-progress">
            <span>
              獨立答對 {s.correct}/{s.total}
            </span>
            <span>
              跨日穩定 {s.stable}/{s.total}
            </span>
            <small>讀過 ≠ 已掌握</small>
          </div>
          <Sources module={m} />
          {idx < modules.length - 1 && (
            <button
              className="text-btn next-unit"
              onClick={() => chooseUnit(modules[idx + 1].id)}
            >
              下一單元：{modules[idx + 1].title}
              <ArrowRight size={16} />
            </button>
          )}
        </article>
      </div>
    </>
  );
}
function PracticeRoom({
  events,
  start,
  daily,
}: {
  events: StudyEvent[];
  start: (s: Session) => void;
  daily: () => void;
}) {
  const [module, setModule] = useState("all"),
    [kind, setKind] = useState("all"),
    [count, setCount] = useState("10");
  const filtered = bank.filter(
    (q) =>
      (module === "all" ||
        (module === "main" &&
          !modules.find((m) => m.id === q.moduleId)!.foundation) ||
        q.moduleId === module) &&
      (kind === "all" || q.type === kind),
  );
  function mixed() {
    const eligible = bank.filter(
      (q) => !modules.find((m) => m.id === q.moduleId)!.foundation,
    );
    const selected = kinds.flatMap((k) =>
      shuffle(eligible.filter((q) => q.type === k)).slice(0, 3),
    );
    start({ title: "模擬小測 · 12 題混合練習", items: shuffle(selected) });
  }
  return (
    <>
      <PageTitle
        eyebrow="PRACTICE, WITH A PURPOSE"
        title="練到能自己做出來。"
        desc="一輪不需要很多題。先答、看拆解、換個數字，再隔一段時間重做。"
      />
      <div className="practice-picks">
        <button className="practice-pick green-card" onClick={daily}>
          <RotateCcw size={24} />
          <span className="mini-label">DAILY LOOP</span>
          <h2>今日短練</h2>
          <p>最多10題，錯題優先、按學習進度補新題。</p>
          <span>
            開始今天一輪 <ArrowUpRight size={18} />
          </span>
        </button>
        <button className="practice-pick" onClick={mixed}>
          <Layers size={24} />
          <span className="mini-label">MIXED CHECK</span>
          <h2>模擬小測</h2>
          <p>CNN 之後 · 12 題 · 四種題型。</p>
          <span>
            試試遷移理解 <ArrowUpRight size={18} />
          </span>
        </button>
        <button
          className="practice-pick"
          onClick={() =>
            start({
              title: "換數字 · 重新推一次",
              items: shuffle(variants).slice(0, 7),
            })
          }
        >
          <Calculator size={24} />
          <span className="mini-label">NEW NUMBERS</span>
          <h2>計算變式</h2>
          <p>換一組數字，方法還用得上嗎？</p>
          <span>
            開始逐步計算 <ArrowUpRight size={18} />
          </span>
        </button>
      </div>
      <section className="custom-practice">
        <span className="mini-label">BUILD YOUR OWN ROUND</span>
        <h2>今天想練哪一部分？</h2>
        <div className="filter-row">
          <label>
            範圍
            <select value={module} onChange={(e) => setModule(e.target.value)}>
              <option value="all">全部（含補底）</option>
              <option value="main">CNN 之後</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            題型
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="all">混合題型</option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {kindName[k]}
                </option>
              ))}
            </select>
          </label>
          <label>
            每輪題數
            <select value={count} onChange={(e) => setCount(e.target.value)}>
              {["5", "10", "15"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="primary"
          onClick={() =>
            start({
              title: "自選練習",
              items: shuffle(filtered).slice(0, Number(count)),
            })
          }
        >
          開始 {Math.min(Number(count), filtered.length)} 題{" "}
          <ArrowRight size={17} />
        </button>
        <p className="muted">
          MC／計算自動核對；短答／程式使用參考答案自評。程式不會在瀏覽器執行。
        </p>
      </section>
      <section className="review-rules">
        <h3>記憶的下一次見面</h3>
        <div>
          <span>未答對／看提示 → 約 10 分鐘</span>
          <span>獨立答對 → 明天</span>
          <span>跨日連續答對 → 3 天，再 7 天</span>
        </div>
        <p>同一天反覆刷對不會立即變成穩定掌握。你也可隨時提早重做。</p>
      </section>
      <p className="muted">
        已累積 {events.filter((e) => e.kind === "answer").length}{" "}
        次練習。模擬小測是原創練習，會即時講解，並非老師試卷。
      </p>
    </>
  );
}
const plan = [
  ["從數字開始", "tensor", "model"],
  ["知道模型怎樣改", "training", "cnn"],
  ["深入 CNN", "deepcnn", "residual", "evaluation"],
  ["一份會更新的記憶", "rnn", "rnn-shape"],
  ["把記憶變成語言模型", "lstm", "language"],
  ["親手算 Attention", "attention", "attention-matrix"],
  ["把積木接起來", "transformer"],
];
function Plan({
  go,
  start,
}: {
  go: (v: string, id?: string) => void;
  start: (s: Session) => void;
}) {
  return (
    <>
      <PageTitle
        eyebrow="SEVEN DAYS, SMALL STEPS"
        title="你只需要知道，今天做甚麼。"
        desc="這是七天的建議順序；確實考試日期尚未提供。先從每日 30 分鐘起步，卡住的單元可以分兩輪。"
      />
      <div className="plan-note">
        每次開始：重做昨天 3 題 → 學一小節 → 練習 →
        用自己的話講一次。新內容多時，加一輪，不需要一次讀完。
      </div>
      <div className="plan-list">
        {plan.map(([title, ...ids], i) => (
          <article className="plan-card" key={title}>
            <div className="day-number">
              <small>DAY</small>
              <strong>{String(i + 1).padStart(2, "0")}</strong>
            </div>
            <div>
              <h2>{title}</h2>
              <div className="plan-links">
                {ids.map((id) => (
                  <button key={id} onClick={() => go("learn", id)}>
                    {modules.find((m) => m.id === id)!.title}
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
              <p>
                {i === 6
                  ? "做12題混合練習，再閉卷列出弱點。最後只看錯題與必要公式，保留休息時間。"
                  : "每個概念先看例題，再關掉解答自己推。開始前先碰一次昨天的錯題。"}
              </p>
            </div>
            <button
              className="secondary"
              onClick={() =>
                start({
                  title: `Day ${i + 1} · 檢查理解`,
                  items: shuffle(
                    questions.filter((q) => ids.includes(q.moduleId)),
                  ).slice(0, 10),
                })
              }
            >
              檢查理解 <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
type Result = {
  q: Question;
  correct: boolean;
  assisted: boolean;
  self: boolean;
};
function PracticeSession({
  session,
  record,
  close,
  next,
}: {
  session: Session;
  record: ReturnType<typeof useStudy>["record"];
  close: () => void;
  next: (kind: Kind) => void;
}) {
  const [deck, setDeck] = useState(session.items),
    [index, setIndex] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [values, setValues] = useState<string[]>([]),
    [text, setText] = useState(""),
    [hint, setHint] = useState(false),
    [submitted, setSubmitted] = useState(false),
    [marked, setMarked] = useState(false),
    [checks, setChecks] = useState<boolean[]>([]),
    [results, setResults] = useState<Result[]>([]),
    [error, setError] = useState("");
  const q = deck[index],
    finished = index >= deck.length;
  useEffect(() => {
    if (index > 0) document.getElementById("question-title")?.focus();
  }, [index]);
  function save(correct: boolean, self: boolean, assisted = hint) {
    if (marked) return;
    record({
      kind: "answer",
      qid: q.id,
      moduleId: q.moduleId,
      correct,
      assisted,
      self,
    });
    setMarked(true);
    setResults((prev) => [...prev, { q, correct, assisted, self }]);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (q.type === "mc") {
      if (choice === null) {
        setError("先選一個答案。");
        return;
      }
      setSubmitted(true);
      save(choice === q.correct, false);
    } else if (q.type === "calc") {
      if (
        !q.fields!.every(
          (_, i) =>
            values[i]?.trim() !== "" && Number.isFinite(Number(values[i])),
        )
      ) {
        setError("每個欄位都填一個數字；可用三位小數。");
        return;
      }
      setSubmitted(true);
      save(gradeNumbers(q, values).every(Boolean), false);
    } else {
      if (text.trim().length < 2) {
        setError("先寫下你的想法，即使只有一兩句。");
        return;
      }
      setSubmitted(true);
    }
  }
  function reveal() {
    setHint(true);
    setSubmitted(true);
    save(false, q.type === "logic" || q.type === "code", true);
  }
  function advance() {
    setIndex(index + 1);
    setChoice(null);
    setValues([]);
    setText("");
    setHint(false);
    setSubmitted(false);
    setMarked(false);
    setChecks([]);
    setError("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function reset(items: Question[]) {
    setDeck(items.map(fresh));
    setIndex(0);
    setChoice(null);
    setValues([]);
    setText("");
    setHint(false);
    setSubmitted(false);
    setMarked(false);
    setChecks([]);
    setResults([]);
    setError("");
  }
  if (finished) {
    const auto = results.filter((r) => !r.self),
      right = auto.filter((r) => r.correct && !r.assisted),
      manual = results.filter((r) => r.self),
      weak = results.filter((r) => !r.correct || r.assisted);
    const nextKind = session.kind
      ? kinds[kinds.indexOf(session.kind) + 1]
      : undefined;
    return (
      <div className="session-results">
        <p className="eyebrow">ONE ROUND, ONE STEP FORWARD</p>
        <div className="result-seal">
          <CheckCheck size={32} />
        </div>
        <h1>這一輪，已經留下來了。</h1>
        <p>結果已保存到本機；頂部顯示「已同步」後，其他裝置就能接續。</p>
        <div className="results-stats">
          <div>
            <strong>
              {right.length}
              <small> / {auto.length}</small>
            </strong>
            <span>自動核對 · 獨立答對</span>
          </div>
          <div>
            <strong>{manual.length}</strong>
            <span>短答／code 自評</span>
          </div>
          <div>
            <strong>{weak.length}</strong>
            <span>需要再碰一次</span>
          </div>
        </div>
        <p className="muted">
          看提示後答對不計獨立；自評不等於已通過自動驗證。穩定題目需不同日期再次獨立答對。
        </p>
        <div className="results-actions">
          {nextKind && session.moduleId ? (
            <button className="primary" onClick={() => next(nextKind)}>
              下一步：{kindName[nextKind]}
              <ArrowRight size={17} />
            </button>
          ) : (
            <button className="primary" onClick={close}>
              回到溫習桌 <ArrowRight size={17} />
            </button>
          )}
          {weak.length > 0 && (
            <button
              className="secondary"
              onClick={() => reset(weak.map((r) => r.q))}
            >
              立即重做弱題 <RotateCcw size={16} />
            </button>
          )}
          <button className="secondary" onClick={() => reset(deck)}>
            再練一輪 <RotateCcw size={16} />
          </button>
          <button
            className="text-btn"
            onClick={() =>
              reset(
                [...new Set(deck.map((q) => q.moduleId))].map((id) =>
                  variant(id, Math.floor(Math.random() * 1e9)),
                ),
              )
            }
          >
            換數字再算
          </button>
        </div>
        <div className="result-review">
          {results.map((r, i) => (
            <div key={i}>
              <span
                className={r.correct && !r.assisted ? "good-text" : "bad-text"}
              >
                {r.correct && !r.assisted ? "✓" : "↻"}
              </span>
              <div>
                <strong>{r.q.prompt.split("\n")[0]}</strong>
                <small>
                  {kindName[r.q.type]} ·{" "}
                  {r.self
                    ? "自評"
                    : r.assisted
                      ? "看過提示／答案"
                      : r.correct
                        ? "獨立答對"
                        : "未答對"}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const m = modules.find((m) => m.id === q.moduleId)!;
  const result = results.at(-1);
  const fieldCheck =
    q.type === "calc" && submitted ? gradeNumbers(q, values) : [];
  return (
    <section className="session">
      <div className="session-top">
        <button className="text-btn" onClick={close}>
          <ChevronLeft size={16} />
          結束這輪
        </button>
        <span>{session.title}</span>
        <strong>
          {index + 1} / {deck.length}
        </strong>
      </div>
      <div className="session-bar">
        <span style={{ width: (index / deck.length) * 100 + "%" }} />
      </div>
      <div className="question-card">
        <div className="question-meta">
          <span className="chip">{kindName[q.type]}</span>
          <span>{m.title}</span>
          {q.variant !== undefined && (
            <span className="variant-label">新數字變式</span>
          )}
        </div>
        <h1 id="question-title" tabIndex={-1}>
          先想一想，再動手。
        </h1>
        <p
          className={
            "question-prompt " + (q.type === "code" ? "code-prompt" : "")
          }
        >
          {q.prompt}
        </p>
        <form onSubmit={submit}>
          {q.type === "mc" ? (
            <fieldset className="choices" disabled={submitted}>
              <legend className="sr-only">選擇你的答案</legend>
              {q.options!.map((option, i) => (
                <label
                  key={i}
                  className={
                    (choice === i ? "picked " : "") +
                    (submitted && i === q.correct ? "correct-option " : "") +
                    (submitted && choice === i && i !== q.correct
                      ? "wrong-option"
                      : "")
                  }
                >
                  <input
                    type="radio"
                    name="choice"
                    value={i}
                    checked={choice === i}
                    onChange={() => setChoice(i)}
                  />
                  <span className="choice-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                  {submitted && i === q.correct && <Check size={18} />}
                </label>
              ))}
            </fieldset>
          ) : q.type === "calc" ? (
            <div className="calc-fields">
              {q.fields!.map((field, i) => (
                <label key={field.label}>
                  <span>
                    <b>{i + 1}</b>
                    {field.label}
                  </span>
                  <div>
                    <input
                      aria-label={field.label}
                      type="text"
                      inputMode="decimal"
                      placeholder="填入數值"
                      disabled={submitted}
                      value={values[i] || ""}
                      onChange={(e) =>
                        setValues((prev) => {
                          const a = [...prev];
                          a[i] = e.target.value;
                          return a;
                        })
                      }
                    />
                    {submitted && (
                      <span
                        className={fieldCheck[i] ? "good-text" : "bad-text"}
                      >
                        {fieldCheck[i]
                          ? "✓ 正確"
                          : `↻ ${field.value.toFixed(3)}`}
                      </span>
                    )}
                  </div>
                </label>
              ))}
              <small>先算中間步驟。最後可保留三位小數；答案只填數字。</small>
            </div>
          ) : (
            <label className="written-answer">
              <span>你的{q.type === "code" ? "修正程式" : "解釋與步驟"}</span>
              <textarea
                aria-label={
                  q.type === "code" ? "你的修正程式" : "你的解釋與步驟"
                }
                className={q.type === "code" ? "mono" : ""}
                disabled={submitted}
                rows={q.type === "code" ? 7 : 5}
                placeholder={
                  q.type === "code"
                    ? "寫下修改後的幾行 code…"
                    : "用自己的話說明原因。先寫出你想到的，即使不完整也可以。"
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <small>
                {q.type === "code"
                  ? "本題不會執行程式。提交後按參考答案及評分點自評。"
                  : "提交後會顯示參考答案；短答使用評分點自評。"}
              </small>
            </label>
          )}
          {!submitted && (
            <>
              <p className="error" role="alert">
                {error}
              </p>
              <div className="answer-actions">
                <button className="primary" type="submit">
                  {q.type === "mc" || q.type === "calc"
                    ? "提交，看看怎樣推"
                    : "寫好了，對照解說"}
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setHint(true)}
                >
                  給我一點提示
                </button>
                <button type="button" className="text-btn" onClick={reveal}>
                  我卡住了，先看拆解
                </button>
              </div>
            </>
          )}
        </form>
        {hint && !submitted && (
          <div className="hint" role="status">
            <strong>只給你下一小步</strong>
            <p>{q.hint}</p>
            <small>這題會記錄為使用提示，之後再閉卷重做一次。</small>
          </div>
        )}
        {submitted && (
          <section className="feedback" aria-live="polite">
            <div
              className={
                "feedback-heading " +
                (marked && result?.correct ? "good" : "retry")
              }
            >
              <strong>
                {!marked
                  ? "對照後，誠實檢查自己"
                  : result?.correct
                    ? result.assisted
                      ? "提示有幫助，下一次獨立試"
                      : "這一步，你做對了"
                    : "找到缺口了，現在拆開看"}
              </strong>
              <span>
                {!marked
                  ? "自評題"
                  : result?.self
                    ? "自評紀錄"
                    : result?.assisted
                      ? "使用提示／答案"
                      : "已自動核對"}
              </span>
            </div>
            <div className="solution">
              <span className="mini-label">REFERENCE ANSWER</span>
              <pre className={q.type === "code" ? "code-answer" : ""}>
                {q.answer}
              </pre>
              <h3>解題邏輯與步驟</h3>
              <ol>
                {q.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              {!marked && (
                <div className="self-rubric">
                  <h3>暫定自評點 · 逐項核對</h3>
                  <p>
                    這不是自動判卷。勾選你原答案已做到的項目，再決定要不要重練。
                  </p>
                  {q.rubric!.map((point, i) => (
                    <label key={point}>
                      <input
                        type="checkbox"
                        checked={checks[i] || false}
                        onChange={(e) =>
                          setChecks((prev) => {
                            const a = [...prev];
                            a[i] = e.target.checked;
                            return a;
                          })
                        }
                      />
                      {point}
                    </label>
                  ))}
                  <div className="answer-actions">
                    <button
                      className="primary"
                      disabled={!q.rubric!.every((_, i) => checks[i])}
                      onClick={() => save(true, true)}
                    >
                      原答案已做到全部
                    </button>
                    <button
                      className="secondary"
                      onClick={() => save(false, true)}
                    >
                      還有缺漏，安排再練
                    </button>
                  </div>
                </div>
              )}
              <p className="verification">
                {q.type === "mc" || q.type === "calc"
                  ? "驗證：依題設答案核對；數值接受最後三位小數。"
                  : "驗證：參考解說已作靜態核對；你的文字／程式由你按評分點自評，未執行。"}
              </p>
            </div>
            <Sources module={m} />
            {marked && (
              <div className="next-question">
                <p>
                  {result?.correct && !result.assisted
                    ? "之後會再回來確認記憶。"
                    : "這題已加入重練；看懂後再用新例子試。"}
                </p>
                <button className="primary" onClick={advance}>
                  {index === deck.length - 1 ? "看這輪結果" : "下一題"}
                  <ArrowRight size={17} />
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </section>
  );
}

function ExampleTable({ visual }: { visual: NonNullable<Lesson["visual"]> }) {
  return (
    <div className="example-grid">
      <table>
        <caption>{visual.caption}</caption>
        {visual.axes && (
          <thead>
            <tr>
              <td></td>
              {visual.rows[0].map((_, i) => (
                <th scope="col" key={i}>
                  第{i + 1}列 ↓
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {visual.rows.map((row, i) => (
            <tr key={i}>
              {visual.axes && <th scope="row">第{i + 1}行 →</th>}
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function MiniCheck({ check }: { check: NonNullable<Lesson["check"]> }) {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <section className="mini-check">
      <p className="mini-label">輪到你觀察 · 不計分</p>
      <h4>{check.prompt}</h4>
      <div>
        {check.options.map((option, i) => (
          <button
            key={option}
            className={"secondary " + (choice === i ? "mini-picked" : "")}
            aria-pressed={choice === i}
            onClick={() => setChoice(i)}
          >
            {option}
          </button>
        ))}
      </div>
      {choice !== null && (
        <p className="mini-feedback" role="status">
          {choice === check.correct
            ? "對，這一步答對了。"
            : "再看一次上面的例子。"}{" "}
          {check.explanation}
        </p>
      )}
    </section>
  );
}
