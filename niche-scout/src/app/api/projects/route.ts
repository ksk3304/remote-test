import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import type { NewProject, ProjectStatus } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") as ProjectStatus | null;
  const sortBy = searchParams.get("sortBy") || "updatedAt";

  let query = db.select().from(projects);

  if (status) {
    query = query.where(eq(projects.status, status)) as typeof query;
  }

  const result = await query.orderBy(
    sortBy === "score"
      ? desc(
          sql`(COALESCE(${projects.scoreDemand}, 0) * 0.25 + COALESCE(${projects.scoreCompetition}, 0) * 0.2 + COALESCE(${projects.scoreImprovement}, 0) * 0.2 + COALESCE(${projects.scoreDifferentiation}, 0) * 0.2 + COALESCE(${projects.scoreImplementation}, 0) * 0.15)`
        )
      : desc(projects.updatedAt)
  );

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body: NewProject = await request.json();

  const result = await db
    .insert(projects)
    .values({
      title: body.title,
      genre: body.genre,
      nicheDesc: body.nicheDesc,
      targetUser: body.targetUser,
      status: body.status || "idea",
      scoreDemand: body.scoreDemand,
      scoreCompetition: body.scoreCompetition,
      scoreImprovement: body.scoreImprovement,
      scoreDifferentiation: body.scoreDifferentiation,
      scoreImplementation: body.scoreImplementation,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
