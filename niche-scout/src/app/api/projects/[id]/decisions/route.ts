import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decisions, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { NewDecision } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await db
    .select()
    .from(decisions)
    .where(eq(decisions.projectId, parseInt(id)))
    .orderBy(desc(decisions.decidedAt));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body: NewDecision = await request.json();

  // 判定を登録
  const result = await db
    .insert(decisions)
    .values({
      projectId: parseInt(id),
      decision: body.decision,
      scoreTotal: body.scoreTotal,
      reasons: body.reasons,
      nextActions: body.nextActions,
    })
    .returning();

  // プロジェクトのステータスを更新
  await db
    .update(projects)
    .set({
      status: body.decision,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, parseInt(id)));

  return NextResponse.json(result[0], { status: 201 });
}
