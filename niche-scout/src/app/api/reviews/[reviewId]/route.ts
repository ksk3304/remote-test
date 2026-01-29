import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewReview } from "@/types";

type RouteParams = { params: Promise<{ reviewId: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { reviewId } = await params;
  const body: Partial<NewReview> = await request.json();

  const result = await db
    .update(reviews)
    .set(body)
    .where(eq(reviews.id, parseInt(reviewId)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { reviewId } = await params;
  await db.delete(reviews).where(eq(reviews.id, parseInt(reviewId)));
  return NextResponse.json({ success: true });
}
