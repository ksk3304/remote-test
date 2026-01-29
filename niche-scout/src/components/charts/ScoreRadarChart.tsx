"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ScoreBreakdown } from "@/lib/scoring";

interface ScoreRadarChartProps {
  score: ScoreBreakdown;
}

export function ScoreRadarChart({ score }: ScoreRadarChartProps) {
  const data = [
    { subject: "需要", value: score.demand, fullMark: 100 },
    { subject: "競争", value: score.competition, fullMark: 100 },
    { subject: "改善余地", value: score.improvement, fullMark: 100 },
    { subject: "差別化", value: score.differentiation, fullMark: 100 },
    { subject: "実装容易性", value: score.implementation, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" fontSize={12} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
        <Radar
          name="スコア"
          dataKey="value"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.5}
        />
        <Tooltip formatter={(value) => [`${value}点`, "スコア"]} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
