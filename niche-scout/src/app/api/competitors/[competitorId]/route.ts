import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { competitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewCompetitor } from "@/types";

type RouteParams = { params: Promise<{ competitorId: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { competitorId } = await params;
  const body: Partial<NewCompetitor> = await request.json();

  const result = await db
    .update(competitors)
    .set(body)
    .where(eq(competitors.id, parseInt(competitorId)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { competitorId } = await params;
  await db.delete(competitors).where(eq(competitors.id, parseInt(competitorId)));
  return NextResponse.json({ success: true });
}
