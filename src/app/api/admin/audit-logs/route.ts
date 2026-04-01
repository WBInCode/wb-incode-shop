import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const entity = searchParams.get("entity");
  const action = searchParams.get("action");
  const actor = searchParams.get("actor");

  const where: Record<string, unknown> = {};
  if (entity) where.entity = entity;
  if (action) where.action = { contains: action };
  if (actor) where.actor = { contains: actor };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    logs: logs.map((log) => ({
      ...log,
      details: (() => {
        try {
          return JSON.parse(log.details);
        } catch {
          return {};
        }
      })(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
