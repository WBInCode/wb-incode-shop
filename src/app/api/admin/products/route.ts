import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseProductArrays } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawProducts = await prisma.product.findMany({
    include: { variants: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  const products = rawProducts.map(parseProductArrays);

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    const product = await prisma.product.create({
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
