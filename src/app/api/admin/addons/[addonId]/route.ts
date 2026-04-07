import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { auditLog, getClientIp } from "@/lib/audit";

type Params = Promise<{ addonId: string }>;

// PUT /api/admin/addons/[addonId]
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { addonId } = await params;
  const body = await request.json();
  const {
    namePl, nameEn, descriptionPl, descriptionEn,
    price, originalPrice, required, badgePl, badgeEn, active, sortOrder,
  } = body;

  const addon = await prisma.addon.update({
    where: { id: addonId },
    data: {
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
    action: "addon.update",
    entity: "addon",
    entityId: addonId,
    actor: session.user?.email || "admin",
    details: { namePl },
    ipAddress: getClientIp(request),
  });

  return NextResponse.json(addon);
}

// DELETE /api/admin/addons/[addonId]
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { addonId } = await params;
  await prisma.addon.delete({ where: { id: addonId } });

  await auditLog({
    action: "addon.delete",
    entity: "addon",
    entityId: addonId,
    actor: session.user?.email || "admin",
    details: {},
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({ success: true });
}
