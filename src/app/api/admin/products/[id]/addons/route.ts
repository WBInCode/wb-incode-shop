import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { auditLog, getClientIp } from "@/lib/audit";

type Params = Promise<{ id: string }>;

// GET /api/admin/products/[id]/addons
export async function GET(_request: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const addons = await prisma.addon.findMany({
    where: { productId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(addons);
}

// POST /api/admin/products/[id]/addons
export async function POST(request: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const {
    namePl, nameEn, descriptionPl, descriptionEn,
    price, originalPrice, required, badgePl, badgeEn, active, sortOrder,
  } = body;

  if (!namePl || !nameEn || price == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const addon = await prisma.addon.create({
    data: {
      productId: id,
      namePl, nameEn,
      descriptionPl: descriptionPl || null,
      descriptionEn: descriptionEn || null,
      price: Math.round(price),
      originalPrice: originalPrice ? Math.round(originalPrice) : null,
      required: required ?? false,
      badgePl: badgePl || null,
      badgeEn: badgeEn || null,
      active: active ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });

  await auditLog({
    action: "addon.create",
    entity: "addon",
    entityId: addon.id,
    actor: session.user?.email || "admin",
    details: { productId: id, namePl },
    ipAddress: getClientIp(request),
  });

  return NextResponse.json(addon, { status: 201 });
}
