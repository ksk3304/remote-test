import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { painPoints } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewPainPoint } from "@/types";

type RouteParams = { params: Promise<{ painPointId: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { painPointId } = await params;
  const body: Partial<NewPainPoint> = await request.json();

  const result = await db
    .update(painPoints)
    .set(body)
    .where(eq(painPoints.id, parseInt(painPointId)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { painPointId } = await params;
  await db.delete(painPoints).where(eq(painPoints.id, parseInt(painPointId)));
  return NextResponse.json({ success: true });
}
