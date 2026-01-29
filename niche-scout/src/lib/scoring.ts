import type { Project } from "@/types";

export interface ScoreBreakdown {
  demand: number;
  competition: number;
  improvement: number;
  differentiation: number;
  implementation: number;
  total: number;
}

export interface ScoreWeights {
  demand: number;
  competition: number;
  improvement: number;
  differentiation: number;
  implementation: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  demand: 0.25,
  competition: 0.2,
  improvement: 0.2,
  differentiation: 0.2,
  implementation: 0.15,
};

export function calculateScore(project: Project): ScoreBreakdown {
  const demand = project.scoreDemand ?? 0;
  const competition = project.scoreCompetition ?? 0;
  const improvement = project.scoreImprovement ?? 0;
  const differentiation = project.scoreDifferentiation ?? 0;
  const implementation = project.scoreImplementation ?? 0;

  const total =
    demand * DEFAULT_WEIGHTS.demand +
    competition * DEFAULT_WEIGHTS.competition +
    improvement * DEFAULT_WEIGHTS.improvement +
    differentiation * DEFAULT_WEIGHTS.differentiation +
    implementation * DEFAULT_WEIGHTS.implementation;

  return {
    demand,
    competition,
    improvement,
    differentiation,
    implementation,
    total: Math.round(total * 100) / 100,
  };
}

export function isGoConditionMet(score: ScoreBreakdown): boolean {
  return score.total >= 70;
}

export interface KillCondition {
  id: string;
  label: string;
  description: string;
}

export const KILL_CONDITIONS: KillCondition[] = [
  {
    id: "no_competitors",
    label: "競合がほぼゼロ",
    description: "需要が不明",
  },
  {
    id: "personal_complaints",
    label: "低評価が「好み」「個別事情」ばかり",
    description: "改善余地が薄い",
  },
  {
    id: "unclear_monetization",
    label: "直接課金の理由が曖昧",
    description: "課金ベネフィットが不明確",
  },
  {
    id: "complex_features",
    label: "個人開発で再現できない重機能が必須",
    description: "SNS/マッチング/複雑同期など",
  },
];

export function determineDecision(
  score: ScoreBreakdown,
  killConditions: string[]
): "go" | "kill" {
  // Kill条件に1つでも該当したら強制Kill
  if (killConditions.length > 0) {
    return "kill";
  }
  // スコアが70点以上でGo
  if (isGoConditionMet(score)) {
    return "go";
  }
  return "kill";
}
