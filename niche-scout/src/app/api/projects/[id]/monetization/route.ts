import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { monetization } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewMonetization } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await db
    .select()
    .from(monetization)
    .where(eq(monetization.projectId, parseInt(id)));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body: NewMonetization = await request.json();

  const result = await db
    .insert(monetization)
    .values({
      projectId: parseInt(id),
      model: body.model,
      price: body.price,
      paywallTrigger: body.paywallTrigger,
      valueProposition: body.valueProposition,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
