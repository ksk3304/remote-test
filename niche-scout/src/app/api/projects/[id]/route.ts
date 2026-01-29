import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewProject } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, parseInt(id)));

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body: Partial<NewProject> = await request.json();

  const result = await db
    .update(projects)
    .set({
      ...body,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, parseInt(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await db.delete(projects).where(eq(projects.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
