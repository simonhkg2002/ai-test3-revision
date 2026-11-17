import type { Question } from "./course";
export type StudyEvent = {
  id: string;
  kind: "answer" | "read";
  qid: string;
  moduleId: string;
  at: number;
  correct: boolean;
  assisted: boolean;
  self: boolean;
};
export const DAY = 86400000;
export function hkDay(at: number) {
  return new Date(at + 8 * 3600000).toISOString().slice(0, 10);
}
export function mergeEvents(...groups: StudyEvent[][]): StudyEvent[] {
  return [...new Map(groups.flat().map((e) => [e.id, e])).values()].sort(
    (a, b) => a.at - b.at || a.id.localeCompare(b.id),
  );
}
export function questionState(qid: string, events: StudyEvent[]) {
  const history = events.filter((e) => e.kind === "answer" && e.qid === qid);
  const last = history.at(-1);
  let streak = 0;
  const days = new Set<string>();
  for (let i = history.length - 1; i >= 0; i--) {
    const e = history[i];
    if (!e.correct || e.assisted || e.self) break;
    const d = hkDay(e.at);
    if (!days.has(d)) {
      days.add(d);
      streak++;
    }
  }
  const stable = streak >= 2;
  const due = last
    ? last.at +
      (!last.correct || last.assisted
        ? 10 * 60000
        : DAY * (streak >= 3 ? 7 : streak >= 2 ? 3 : 1))
    : 0;
  return { last, streak, stable, due, attempts: history.length };
}
export function gradeNumbers(q: Question, answers: string[]) {
  return q.fields!.map(
    (f, i) =>
      answers[i]?.trim() !== "" &&
      Number.isFinite(Number(answers[i])) &&
      Math.abs(Number(answers[i]) - f.value) <= f.tolerance,
  );
}
export function variant(moduleId: string, seed: number): Question {
  let n = seed >>> 0;
  const r = (min: number, max: number) => {
    n = (1664525 * n + 1013904223) >>> 0;
    return min + (n % (max - min + 1));
  };
  const a = r(1, 5),
    b = r(1, 4),
    c = r(1, 3);
  let prompt = "",
    fields: { label: string; value: number; tolerance: number }[] = [],
    steps: string[] = [];
  const f = (label: string, value: number) => ({
    label,
    value,
    tolerance: 0.002,
  });
  switch (moduleId) {
    case "tensor":
      prompt = `A=[[${a},${b}],[${c},1]]，v=[2,3]。求 A@v 的每個coordinate。`;
      fields = [f("coordinate1", 2 * a + 3 * b), f("coordinate2", 2 * c + 3)];
      steps = [`${a}×2+${b}×3=${2 * a + 3 * b}`, `${c}×2+1×3=${2 * c + 3}`];
      break;
    case "model":
      prompt = `pred=[${a + c},${b + 2}]，target=[${a},0]。計 MSE、MAE。`;
      fields = [
        f("MSE", (c * c + (b + 2) ** 2) / 2),
        f("MAE", (c + b + 2) / 2),
      ];
      steps = [
        `errors=[${c},${b + 2}]。`,
        `MSE=(${c}²+${b + 2}²)/2；MAE=(${c}+${b + 2})/2。`,
      ];
      break;
    case "training":
      prompt = `x=${a}, w=${b}, target=${a * b + 2}；absolute loss，lr=0.1。求 prediction、gradient、w_new。`;
      fields = [
        f("prediction", a * b),
        f("gradient", -a),
        f("w_new", b + 0.1 * a),
      ];
      steps = [
        `prediction=${a * b}，error=-2，sign=-1。`,
        `gradient=-${a}；w_new=${b}-0.1×(-${a})=${b + 0.1 * a}。`,
      ];
      break;
    case "cnn":
    case "deepcnn": {
      const size = 8 + 4 * a,
        cout = 2 * b;
      prompt = `input邊長${size}，Conv Cin=3,Cout=${cout},K=3,P=1,S=1，有bias；再pool K=2,S=2。`;
      fields = [
        f("conv邊長", size),
        f("pool邊長", size / 2),
        f("conv參數", 28 * cout),
      ];
      steps = [
        `Conv保持邊長${size}；pool變${size / 2}。`,
        `參數=(9×3+1)×${cout}=${28 * cout}。`,
      ];
      break;
    }
    case "residual":
      prompt = `沒有末端activation。F′=${b / 10}，上游gradient=${a}。求plain與residual gradient。`;
      fields = [f("plain", (a * b) / 10), f("residual", a * (1 + b / 10))];
      steps = [`plain=${a}×${b / 10}。`, `residual=${a}×(1+${b / 10})。`];
      break;
    case "evaluation": {
      const B = 2 * a,
        C = 4 * b;
      prompt = `float32 tensor shape=(${B},${C},16,16)，每值4bytes。計元素數、KiB（1KiB=1024bytes）。`;
      fields = [f("元素數", B * C * 256), f("KiB", B * C)];
      steps = [
        `${B}×${C}×16×16=${B * C * 256}。`,
        `bytes再乘4，除1024=${B * C}KiB。`,
      ];
      break;
    }
    case "rnn": {
      const x = a / 2,
        h = b / 10,
        z = 0.4 * x + 0.2 * h;
      prompt = `h=tanh(.4x+.2h_prev)，x=${x},h_prev=${h}。`;
      fields = [f("pre-activation", z), f("h", Math.tanh(z))];
      steps = [
        `pre=.4×${x}+.2×${h}=${z}。`,
        `h=tanh(pre)=${Math.tanh(z).toFixed(6)}。`,
      ];
      break;
    }
    case "rnn-shape":
      prompt = `手寫單bias RNN，input size=${a}，hidden size=${b + 2}。`;
      fields = [
        f("Wx數", a * (b + 2)),
        f("Wh數", (b + 2) ** 2),
        f("總參數", a * (b + 2) + (b + 2) ** 2 + b + 2),
      ];
      steps = [
        `Wx=H×F，Wh=H²，b=H。`,
        `總數=${a * (b + 2) + (b + 2) ** 2 + b + 2}，不乘time steps。`,
      ];
      break;
    case "lstm": {
      const cp = a / 10,
        g = (b - 2) / 5,
        cell = 0.5 * cp + 0.25 * g;
      prompt = `LSTM c_prev=${cp},f=.5,i=.25,g=${g},o=.8。`;
      fields = [
        f("舊貢獻", 0.5 * cp),
        f("新貢獻", 0.25 * g),
        f("c", cell),
        f("h", 0.8 * Math.tanh(cell)),
      ];
      steps = [
        `c=.5×${cp}+.25×${g}=${cell}。`,
        `h=.8×tanh(${cell})=${(0.8 * Math.tanh(cell)).toFixed(6)}。`,
      ];
      break;
    }
    case "language": {
      const p = (a + 1) / 10;
      prompt = `兩個位置真token概率為${p}和0.5；求兩個CE及平均（自然對數）。`;
      fields = [
        f("loss1", -Math.log(p)),
        f("loss2", Math.log(2)),
        f("mean", (-Math.log(p) + Math.log(2)) / 2),
      ];
      steps = [`分別-ln(${p})及-ln(.5)。`, "先各自計loss，再平均。"];
      break;
    }
    case "attention":
      prompt = `q=[${a},${b}]，keys=[[1,0],[0,1]]；不scale，Values=[[2,0],[0,4]]。`;
      {
        const w = 1 / (1 + Math.exp(b - a));
        fields = [
          f("score1", a),
          f("score2", b),
          f("weight1", w),
          f("z1", 2 * w),
          f("z2", 4 * (1 - w)),
        ];
        steps = [
          `scores=[${a},${b}]。`,
          `w1=exp(${a})/(exp(${a})+exp(${b}))≈${w.toFixed(6)}。`,
          "z=[2w1,4(1-w1)]。",
        ];
      }
      break;
    case "attention-matrix": {
      const gap = 2 * b,
        w = 1 / (1 + Math.exp(gap / 2));
      prompt = `scores=[0,${gap}]，dk=4，V=[[${a},0],[0,${c + 1}]]。使用scaled attention。`;
      fields = [
        f("scaled score2", gap / 2),
        f("weight1", w),
        f("z1", a * w),
        f("z2", (c + 1) * (1 - w)),
      ];
      steps = [
        `先除sqrt4=2，scores=[0,${gap / 2}]。`,
        `weight1≈${w.toFixed(6)}。`,
        "輸出每個coordinate都用weights乘Values。",
      ];
      break;
    }
    default:
      prompt = `embedding=[${a / 10},${b / 10}]，position=[0.5,-0.2]，逐coordinate相加。`;
      fields = [f("coordinate1", a / 10 + 0.5), f("coordinate2", b / 10 - 0.2)];
      steps = ["同位置相加，不是concat。"];
  }
  return {
    id: `${moduleId}-variant`,
    moduleId,
    type: "calc",
    prompt,
    fields,
    steps,
    answer: fields.map((x) => `${x.label}=${x.value.toFixed(3)}`).join("；"),
    hint: "先寫出公式，代入每一個中間值。最後保留三位小數。",
    variant: seed,
  };
}
