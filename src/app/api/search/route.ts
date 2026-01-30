import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true },
    }),
    prisma.task.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 10,
      select: { id: true, title: true, projectId: true },
    }),
  ]);

  return NextResponse.json([
    ...projects.map((p) => ({ type: "project" as const, id: p.id, title: p.name })),
    ...tasks.map((t) => ({ type: "task" as const, id: t.id, title: t.title, projectId: t.projectId })),
  ]);
}
