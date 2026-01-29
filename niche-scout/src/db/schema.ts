import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Projects (案件)
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  nicheDesc: text("niche_desc"),
  targetUser: text("target_user"),
  status: text("status", { enum: ["idea", "research", "go", "kill"] })
    .notNull()
    .default("idea"),
  // スコア (1-100)
  scoreDemand: integer("score_demand"),
  scoreCompetition: integer("score_competition"),
  scoreImprovement: integer("score_improvement"),
  scoreDifferentiation: integer("score_differentiation"),
  scoreImplementation: integer("score_implementation"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Keywords (検索キーワード)
export const keywords = sqliteTable("keywords", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  keyword: text("keyword").notNull(),
  intent: text("intent"),
  notes: text("notes"),
});

// Competitors (競合アプリ)
export const competitors = sqliteTable("competitors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  appName: text("app_name").notNull(),
  storeUrl: text("store_url"),
  priceType: text("price_type", { enum: ["free", "paid", "sub"] }),
  priceValue: text("price_value"),
  lastUpdate: text("last_update"),
  rating: real("rating"),
  installsHint: text("installs_hint"),
  painTop3: text("pain_top3"),
  lowQualityEvidence: text("low_quality_evidence"),
  winningPoint: text("winning_point"),
  notes: text("notes"),
});

// Reviews (レビュー)
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  competitorId: integer("competitor_id")
    .notNull()
    .references(() => competitors.id, { onDelete: "cascade" }),
  star: integer("star").notNull(),
  text: text("text"),
  date: text("date"),
});

// Pain Points (不満タグ)
export const painPoints = sqliteTable("pain_points", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
  count: integer("count").notNull().default(1),
  representativeQuotes: text("representative_quotes"),
  fixIdea: text("fix_idea"),
});

// Monetization (課金モデル)
export const monetization = sqliteTable("monetization", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  model: text("model", { enum: ["one_time", "sub"] }).notNull(),
  price: text("price"),
  paywallTrigger: text("paywall_trigger"),
  valueProposition: text("value_proposition"),
});

// Decisions (判定ログ)
export const decisions = sqliteTable("decisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  decision: text("decision", { enum: ["go", "kill"] }).notNull(),
  scoreTotal: real("score_total"),
  reasons: text("reasons"),
  nextActions: text("next_actions"),
  decidedAt: text("decided_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  keywords: many(keywords),
  competitors: many(competitors),
  painPoints: many(painPoints),
  monetization: many(monetization),
  decisions: many(decisions),
}));

export const keywordsRelations = relations(keywords, ({ one }) => ({
  project: one(projects, {
    fields: [keywords.projectId],
    references: [projects.id],
  }),
}));

export const competitorsRelations = relations(competitors, ({ one, many }) => ({
  project: one(projects, {
    fields: [competitors.projectId],
    references: [projects.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  competitor: one(competitors, {
    fields: [reviews.competitorId],
    references: [competitors.id],
  }),
}));

export const painPointsRelations = relations(painPoints, ({ one }) => ({
  project: one(projects, {
    fields: [painPoints.projectId],
    references: [projects.id],
  }),
}));

export const monetizationRelations = relations(monetization, ({ one }) => ({
  project: one(projects, {
    fields: [monetization.projectId],
    references: [projects.id],
  }),
}));

export const decisionsRelations = relations(decisions, ({ one }) => ({
  project: one(projects, {
    fields: [decisions.projectId],
    references: [projects.id],
  }),
}));
