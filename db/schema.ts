import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const studyEvents = sqliteTable("study_events", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  qid: text("qid").notNull(),
  moduleId: text("module_id").notNull(),
  at: integer("at").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  assisted: integer("assisted", { mode: "boolean" }).notNull(),
  self: integer("self", { mode: "boolean" }).notNull(),
});
