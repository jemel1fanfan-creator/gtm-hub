import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET() {
  const teams = await prisma.team.findMany({
    select: { id: true, name: true, type: true, color: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(teams);
}
