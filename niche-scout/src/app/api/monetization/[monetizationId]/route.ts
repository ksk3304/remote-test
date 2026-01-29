import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { monetization } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewMonetization } from "@/types";

type RouteParams = { params: Promise<{ monetizationId: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { monetizationId } = await params;
  const body: Partial<NewMonetization> = await request.json();

  const result = await db
    .update(monetization)
    .set(body)
    .where(eq(monetization.id, parseInt(monetizationId)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { monetizationId } = await params;
  await db
    .delete(monetization)
    .where(eq(monetization.id, parseInt(monetizationId)));
  return NextResponse.json({ success: true });
}
