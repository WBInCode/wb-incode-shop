import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { auditLog, getClientIp } from "@/lib/audit";

type Params = Promise<{ id: string }>;

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      slug,
      namePl,
      nameEn,
      descriptionPl,
      descriptionEn,
      categoryPl,
      categoryEn,
      technologies,
      screenshots,
      videoUrl,
      fileUrl,
      variants,
    } = body;

    // Delete existing variants and recreate
    await prisma.variant.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        slug,
        namePl,
        nameEn,
        descriptionPl,
        descriptionEn,
        categoryPl,
        categoryEn,
        technologies: JSON.stringify(technologies || []),
        screenshots: JSON.stringify(screenshots || []),
        videoUrl: videoUrl || null,
        fileUrl,
        variants: {
          create: variants.map((v: { namePl: string; nameEn: string; descriptionPl: string; descriptionEn: string; price: number }) => ({
            namePl: v.namePl,
            nameEn: v.nameEn,
            descriptionPl: v.descriptionPl,
            descriptionEn: v.descriptionEn,
            price: v.price,
          })),
        },
      },
      include: { variants: true },
    });

    await auditLog({
      action: "product.update",
      entity: "product",
      entityId: id,
      actor: session.user?.email || "admin",
      details: { slug, namePl, nameEn, categoryPl, variantsCount: variants?.length || 0 },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: body,
    });

    await auditLog({
      action: "product.patch",
      entity: "product",
      entityId: id,
      actor: session.user?.email || "admin",
      details: body,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Patch product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id }, select: { slug: true, namePl: true } });
    await prisma.product.delete({ where: { id } });

    await auditLog({
      action: "product.delete",
      entity: "product",
      entityId: id,
      actor: session.user?.email || "admin",
      details: { slug: product?.slug, namePl: product?.namePl },
      ipAddress: getClientIp(_request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
