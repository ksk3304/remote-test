import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { keywords } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewKeyword } from "@/types";

type RouteParams = { params: Promise<{ keywordId: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { keywordId } = await params;
  const body: Partial<NewKeyword> = await request.json();

  const result = await db
    .update(keywords)
    .set(body)
    .where(eq(keywords.id, parseInt(keywordId)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { keywordId } = await params;
  await db.delete(keywords).where(eq(keywords.id, parseInt(keywordId)));
  return NextResponse.json({ success: true });
}
