import data from "../data/course.json";
export type Kind = "mc" | "logic" | "calc" | "code";
export type Lesson = {
  title: string;
  body: string;
  example: string;
  steps: string[];
  trap: string;
};
export type Module = {
  id: string;
  title: string;
  en: string;
  intro: string;
  sources: string[];
  lessons: Lesson[];
  formula: string[];
  minutes: number;
  foundation: boolean;
};
export type Question = {
  id: string;
  moduleId: string;
  type: Kind;
  prompt: string;
  answer: string;
  hint: string;
  steps: string[];
  options?: string[];
  correct?: number;
  fields?: { label: string; value: number; tolerance: number }[];
  rubric?: string[];
  variant?: number;
};
export const modules = data.modules as Module[];
export const questions = data.questions as Question[];
export const kindName: Record<Kind, string> = {
  mc: "選擇題",
  logic: "邏輯短答",
  calc: "逐步計算",
  code: "程式修正",
};
