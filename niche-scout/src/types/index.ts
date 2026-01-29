import type {
  projects,
  keywords,
  competitors,
  reviews,
  painPoints,
  monetization,
  decisions,
} from "@/db/schema";

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Keyword = typeof keywords.$inferSelect;
export type NewKeyword = typeof keywords.$inferInsert;

export type Competitor = typeof competitors.$inferSelect;
export type NewCompetitor = typeof competitors.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type PainPoint = typeof painPoints.$inferSelect;
export type NewPainPoint = typeof painPoints.$inferInsert;

export type Monetization = typeof monetization.$inferSelect;
export type NewMonetization = typeof monetization.$inferInsert;

export type Decision = typeof decisions.$inferSelect;
export type NewDecision = typeof decisions.$inferInsert;

export type ProjectStatus = "idea" | "research" | "go" | "kill";
export type PriceType = "free" | "paid" | "sub";
export type MonetizationModel = "one_time" | "sub";
export type DecisionType = "go" | "kill";
