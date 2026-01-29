import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewReview } from "@/types";

type RouteParams = { params: Promise<{ competitorId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { competitorId } = await params;
  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.competitorId, parseInt(competitorId)));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { competitorId } = await params;
  const body: NewReview = await request.json();

  const result = await db
    .insert(reviews)
    .values({
      competitorId: parseInt(competitorId),
      star: body.star,
      text: body.text,
      date: body.date,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
