import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { keywords } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewKeyword } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await db
    .select()
    .from(keywords)
    .where(eq(keywords.projectId, parseInt(id)));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body: NewKeyword = await request.json();

  const result = await db
    .insert(keywords)
    .values({
      projectId: parseInt(id),
      keyword: body.keyword,
      intent: body.intent,
      notes: body.notes,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
