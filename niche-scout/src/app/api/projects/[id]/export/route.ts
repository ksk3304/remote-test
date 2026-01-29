import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  projects,
  keywords,
  competitors,
  reviews,
  painPoints,
  monetization,
  decisions,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { calculateScore } from "@/lib/scoring";
import { formatDate } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") || "markdown";

  const projectId = parseInt(id);

  // 全データ取得
  const [
    projectData,
    keywordsData,
    competitorsData,
    painPointsData,
    monetizationData,
    decisionsData,
  ] = await Promise.all([
    db.select().from(projects).where(eq(projects.id, projectId)),
    db.select().from(keywords).where(eq(keywords.projectId, projectId)),
    db.select().from(competitors).where(eq(competitors.projectId, projectId)),
    db
      .select()
      .from(painPoints)
      .where(eq(painPoints.projectId, projectId))
      .orderBy(desc(painPoints.count)),
    db.select().from(monetization).where(eq(monetization.projectId, projectId)),
    db
      .select()
      .from(decisions)
      .where(eq(decisions.projectId, projectId))
      .orderBy(desc(decisions.decidedAt)),
  ]);

  if (projectData.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const project = projectData[0];

  // 競合ごとのレビューを取得
  const competitorsWithReviews = await Promise.all(
    competitorsData.map(async (competitor) => {
      const reviewsData = await db
        .select()
        .from(reviews)
        .where(eq(reviews.competitorId, competitor.id));
      return { ...competitor, reviews: reviewsData };
    })
  );

  if (format === "csv") {
    // CSV形式
    const csvFiles: Record<string, string> = {};

    // competitors.csv
    csvFiles["competitors.csv"] = [
      "App名,URL,価格タイプ,価格,最終更新日,評価,インストール数,不満Top3,品質低い根拠,勝てる一点,メモ",
      ...competitorsData.map((c) =>
        [
          c.appName,
          c.storeUrl || "",
          c.priceType || "",
          c.priceValue || "",
          c.lastUpdate || "",
          c.rating?.toString() || "",
          c.installsHint || "",
          c.painTop3 || "",
          c.lowQualityEvidence || "",
          c.winningPoint || "",
          c.notes || "",
        ]
          .map((v) => `"${v.replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    // pain_points.csv
    csvFiles["pain_points.csv"] = [
      "タグ,件数,代表的なコメント,改善案",
      ...painPointsData.map((p) =>
        [
          p.tag,
          p.count.toString(),
          p.representativeQuotes || "",
          p.fixIdea || "",
        ]
          .map((v) => `"${v.replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    // keywords.csv
    csvFiles["keywords.csv"] = [
      "キーワード,意図,メモ",
      ...keywordsData.map((k) =>
        [k.keyword, k.intent || "", k.notes || ""]
          .map((v) => `"${v.replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    return NextResponse.json(csvFiles);
  }

  // Markdown形式
  const score = calculateScore(project);
  const latestDecision = decisionsData[0];
  const latestMonetization = monetizationData[0];

  const markdown = `# ${project.title}

## ニッチ定義

- **ジャンル**: ${project.genre}
- **ニッチ説明**: ${project.nicheDesc || "未設定"}
- **ターゲットユーザー**: ${project.targetUser || "未設定"}
- **ステータス**: ${project.status.toUpperCase()}
- **作成日**: ${formatDate(project.createdAt)}
- **更新日**: ${formatDate(project.updatedAt)}

## スコア

| 指標 | スコア |
|------|--------|
| 需要（入口の明確さ） | ${score.demand}/100 |
| 競争（大手密度） | ${score.competition}/100 |
| 改善余地（不満の反復性） | ${score.improvement}/100 |
| 差別化の明快さ | ${score.differentiation}/100 |
| 実装容易性（2週間） | ${score.implementation}/100 |
| **総合スコア** | **${score.total}/100** |

## キーワード（ASO）

${
  keywordsData.length > 0
    ? keywordsData.map((k) => `- **${k.keyword}**: ${k.intent || ""}`).join("\n")
    : "未設定"
}

## 競合分析（${competitorsWithReviews.length}本）

${
  competitorsWithReviews.length > 0
    ? competitorsWithReviews
        .map(
          (c) => `### ${c.appName}

- **URL**: ${c.storeUrl || "未設定"}
- **価格**: ${c.priceType || "未設定"} ${c.priceValue ? `(${c.priceValue})` : ""}
- **最終更新**: ${c.lastUpdate || "不明"}
- **評価**: ${c.rating ? `★${c.rating}` : "不明"}
- **不満Top3**: ${c.painTop3 || "未設定"}
- **品質低い根拠**: ${c.lowQualityEvidence || "未設定"}
- **勝てる一点**: ${c.winningPoint || "未設定"}
`
        )
        .join("\n")
    : "競合未登録"
}

## 不満タグTop10

${
  painPointsData.length > 0
    ? painPointsData
        .slice(0, 10)
        .map((p, i) => `${i + 1}. **${p.tag}** (${p.count}件)${p.representativeQuotes ? `: "${p.representativeQuotes}"` : ""}`)
        .join("\n")
    : "未設定"
}

## 課金モデル

${
  latestMonetization
    ? `- **モデル**: ${latestMonetization.model === "one_time" ? "買い切り" : "サブスクリプション"}
- **価格**: ${latestMonetization.price || "未設定"}
- **課金トリガー**: ${latestMonetization.paywallTrigger || "未設定"}
- **価値提案**: ${latestMonetization.valueProposition || "未設定"}`
    : "未設定"
}

## 判定ログ

${
  latestDecision
    ? `### 最新判定: ${latestDecision.decision.toUpperCase()}

- **スコア**: ${latestDecision.scoreTotal || "N/A"}
- **判定日**: ${formatDate(latestDecision.decidedAt)}
- **理由**: ${latestDecision.reasons || "未設定"}
- **次のアクション**: ${latestDecision.nextActions || "未設定"}`
    : "判定なし"
}

---
*Generated by NicheScout on ${formatDate(new Date().toISOString())}*
`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${project.title.replace(/[^\w\s-]/g, "")}_report.md"`,
    },
  });
}
