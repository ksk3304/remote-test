import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { competitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewCompetitor } from "@/types";
import { parseCSV } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await db
    .select()
    .from(competitors)
    .where(eq(competitors.projectId, parseInt(id)));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") || "";

  // CSVインポート
  if (contentType.includes("text/csv")) {
    const csvText = await request.text();
    const rows = parseCSV(csvText);

    // ヘッダー行をスキップ
    const dataRows = rows.slice(1);
    const results = [];

    for (const row of dataRows) {
      if (row.length < 2 || !row[0]) continue;

      const result = await db
        .insert(competitors)
        .values({
          projectId: parseInt(id),
          appName: row[0],
          storeUrl: row[1] || null,
          priceType: (row[2] as "free" | "paid" | "sub") || null,
          priceValue: row[3] || null,
          lastUpdate: row[4] || null,
          rating: row[5] ? parseFloat(row[5]) : null,
          installsHint: row[6] || null,
          painTop3: row[7] || null,
          lowQualityEvidence: row[8] || null,
          winningPoint: row[9] || null,
          notes: row[10] || null,
        })
        .returning();
      results.push(result[0]);
    }

    return NextResponse.json(results, { status: 201 });
  }

  // 通常のJSON登録
  const body: NewCompetitor = await request.json();

  const result = await db
    .insert(competitors)
    .values({
      projectId: parseInt(id),
      appName: body.appName,
      storeUrl: body.storeUrl,
      priceType: body.priceType,
      priceValue: body.priceValue,
      lastUpdate: body.lastUpdate,
      rating: body.rating,
      installsHint: body.installsHint,
      painTop3: body.painTop3,
      lowQualityEvidence: body.lowQualityEvidence,
      winningPoint: body.winningPoint,
      notes: body.notes,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
