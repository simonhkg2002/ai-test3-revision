import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DAY,
  rewardCount,
  hkDay,
  questionState,
  mergeEvents,
  gradeNumbers,
  variant,
} from "../lib/study.ts";
const { modules, questions } = JSON.parse(
  readFileSync(new URL("../data/course.json", import.meta.url)),
);
const event = (id, at, more = {}) => ({
  id,
  at,
  qid: "tensor-m1",
  moduleId: "tensor",
  kind: "answer",
  correct: true,
  assisted: false,
  self: false,
  ...more,
});
test("all content is complete, IDs unique, grading fields and module references valid", () => {
  assert.equal(modules.length, 14);
  assert.equal(questions.length, 120);
  assert.equal(new Set(questions.map((q) => q.id)).size, 120);
  for (const m of modules) {
    assert.ok(m.lessons.length >= 3);
    assert.ok(m.sources.length);
    for (const type of ["mc", "logic", "calc", "code"])
      assert.ok(questions.some((q) => q.moduleId === m.id && q.type === type));
  }
  for (const q of questions) {
    assert.ok(modules.some((m) => m.id === q.moduleId));
    assert.ok(q.steps.length && q.hint && q.answer);
    if (q.type === "mc") {
      assert.equal(q.options.length, 4);
      assert.ok(q.correct >= 0 && q.correct < 4);
    }
    if (q.type === "calc")
      for (const f of q.fields) {
        assert.ok(Number.isFinite(f.value));
        assert.ok(f.tolerance > 0);
      }
    if (["logic", "code"].includes(q.type)) assert.ok(q.rubric.length >= 3);
  }
});
test("numeric answer oracle, independently recomputed from the question inputs", () => {
  const expected = {
    "tensor-c1": [10, 6],
    "tensor-c2": [1800, 7200],
    "model-c1": [2.5, 1.5],
    "model-c2": [0.3, -Math.log(0.3)],
    "training-c1": [6, -3, 2.15],
    "training-c2": [12, 1.5],
    "cnn-c1": [6, 3, 36],
    "cnn-c2": [5, 5],
    "deepcnn-c1": [404, 296, 108],
    "deepcnn-c2": [8, 4, 256],
    "residual-c1": [2, 0, 10],
    "residual-c2": [0.6, 3.6],
    "evaluation-c1": [40, 80],
    "evaluation-c2": [131072, 0.5],
    "rnn-c1": [0.8, 0.1, 0.9, Math.tanh(0.9)],
    "rnn-c2": [
      Math.tanh(1),
      -1 + 0.5 * Math.tanh(1),
      Math.tanh(-1 + 0.5 * Math.tanh(1)),
    ],
    "rnn-shape-c1": [12, 16, 4, 32],
    "rnn-shape-c2": [192, 32, 8],
    "lstm-c1": [0.4, 0.1, 0.5, 0.6 * Math.tanh(0.5)],
    "lstm-c2": [0.5, 0.4, -0.1, 0.3],
    "language-c1": [Math.log(2), Math.log(4), (Math.log(2) + Math.log(4)) / 2],
    "language-c2": [12, 11, 12],
    "attention-c1": [2, 2, 3],
    "attention-c2": [0.5, 3],
    "attention-matrix-c1": [1, 0, 2, 1],
    "attention-matrix-c2": [
      2,
      1 / (1 + Math.exp(2)),
      Math.exp(2) / (1 + Math.exp(2)),
      2 / (1 + Math.exp(2)),
      (4 * Math.exp(2)) / (1 + Math.exp(2)),
    ],
    "transformer-c1": [1.3, -0.1],
    "transformer-c2": [5, 5, -3 / Math.sqrt(5), 3 / Math.sqrt(5)],
    "attention-matrix-c3": [1, 0, 1, 0, 1, 1, 1, 1, 2],
    "attention-matrix-c4": [
      1 / (2 + Math.E),
      1 / (2 + Math.E),
      Math.E / (2 + Math.E),
      (1 + Math.E) / (2 + Math.E),
      (1 + Math.E) / (2 + Math.E),
    ],
    "rnn-c3": [1, -1, 0.1, 0.2, 1.1, -0.8, Math.tanh(1.1), Math.tanh(-0.8)],
    "lstm-c3": [
      0.4,
      -0.1,
      0.1,
      -0.1,
      0.5,
      -0.2,
      0.6 * Math.tanh(0.5),
      0.8 * Math.tanh(-0.2),
    ],
    "residual-c3": [-1.5, -1, 4, 0, 0, 4],
    "deepcnn-c3": [1168, 1168, 294912, 73728, 4],
    "evaluation-c3": [32, 9],
    "language-c3": [0.003, 0.004, 0.007],
  };
  assert.equal(
    Object.keys(expected).length,
    questions.filter((q) => q.type === "calc").length,
  );
  for (const [id, values] of Object.entries(expected)) {
    const q = questions.find((q) => q.id === id);
    assert.equal(q.fields.length, values.length);
    q.fields.forEach((f, i) =>
      assert.ok(
        Math.abs(f.value - values[i]) < 1e-6,
        `${id} ${f.label}: ${f.value} != ${values[i]}`,
      ),
    );
  }
});
test("blank, nonnumeric and incorrect inputs cannot receive credit; final rounding can", () => {
  const q = questions.find((q) => q.id === "model-c2");
  assert.deepEqual(gradeNumbers(q, ["", ""]), [false, false]);
  assert.deepEqual(gradeNumbers(q, ["x", "Infinity"]), [false, false]);
  assert.deepEqual(gradeNumbers(q, [".3", "1.204"]), [true, true]);
  assert.deepEqual(gradeNumbers(q, [".5", "1.204"]), [false, true]);
});
test("Hong Kong date boundary and spacing do not reward same-day repeats or hints", () => {
  const t = Date.parse("2026-11-17T08:00:00Z");
  assert.equal(hkDay(Date.parse("2026-11-17T16:01:00Z")), "2026-11-18");
  assert.equal(
    questionState("tensor-m1", [event("a", t), event("b", t + 1000)]).stable,
    false,
  );
  const across = [event("a", t), event("b", t + DAY)];
  assert.equal(questionState("tensor-m1", across).stable, true);
  assert.equal(questionState("tensor-m1", across).due, t + 4 * DAY);
  for (const more of [{ assisted: true }, { self: true }, { correct: false }])
    assert.equal(
      questionState("tensor-m1", [...across, event("c", t + 2 * DAY, more)])
        .stable,
      false,
    );
  assert.equal(
    questionState("tensor-m1", [event("c", t, { correct: false })]).due,
    t + 600000,
  );
  assert.equal(questionState("tensor-m1", []).last, undefined);
});
test("offline and remote records merge by ID without discarding concurrent answers", () => {
  const a = event("a", 1),
    b = event("b", 2),
    c = event("c", 3);
  assert.deepEqual(
    mergeEvents([a, b], [b, c]).map((e) => e.id),
    ["a", "b", "c"],
  );
});
test("all 14 numerical families produce reproducible finite variations over 100 seeds", () => {
  for (const m of modules)
    for (let seed = 1; seed <= 100; seed++) {
      const q = variant(m.id, seed);
      assert.deepEqual(q, variant(m.id, seed));
      assert.equal(q.id, m.id + "-variant");
      assert.ok(q.fields.length > 0);
      assert.ok(q.fields.every((f) => Number.isFinite(f.value)));
      assert.ok(
        gradeNumbers(
          q,
          q.fields.map((f) => f.value.toFixed(3)),
        ).every(Boolean),
      );
    }
});
test("beginner lessons introduce one visual example at a time and keep checks answerable", () => {
  const first = modules[0].lessons;
  assert.equal(first.length, 21);
  assert.match(first[0].example, /任務/);
  assert.match(first[9].steps.join(" "), /@/);
  assert.match(first[10].steps.join(" "), /39/);
  assert.deepEqual(first[4].visual.rows[0], ["日期 / 水果", "蘋果", "橙", "梨"]);
  for (const lesson of first) {
    assert.ok(lesson.check);
    assert.ok(
      lesson.check.correct >= 0 &&
        lesson.check.correct < lesson.check.options.length,
    );
    if (lesson.visual) {
      const width = lesson.visual.rows[0].length;
      assert.ok(lesson.visual.rows.every((row) => row.length === width));
    }
  }
});

test("rewards count distinct correct answers, allow learning retries, exclude self grading", () => {
  const at = Date.now();
  assert.equal(rewardCount([
    event("a", at, {correct:false}), event("b", at), event("c", at),
    event("d", at, {qid:"tensor-lesson-v2-0", assisted:true}),
    event("e", at, {qid:"tensor-l1", self:true}),
    event("f", at, {qid:"tensor-read", kind:"read"}),
  ]), 2);
  assert.equal(rewardCount([]), 0);
});
