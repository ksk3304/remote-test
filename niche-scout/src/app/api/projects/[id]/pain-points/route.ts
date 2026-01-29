import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { painPoints } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { NewPainPoint } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await db
    .select()
    .from(painPoints)
    .where(eq(painPoints.projectId, parseInt(id)))
    .orderBy(desc(painPoints.count));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body: NewPainPoint = await request.json();

  const result = await db
    .insert(painPoints)
    .values({
      projectId: parseInt(id),
      tag: body.tag,
      count: body.count || 1,
      representativeQuotes: body.representativeQuotes,
      fixIdea: body.fixIdea,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
