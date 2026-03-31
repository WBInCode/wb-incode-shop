import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: { product: true, variant: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const paidOrders = user.orders.filter((o) => o.status === "PAID");

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    ordersCount: paidOrders.length,
    totalSpent: paidOrders.reduce((sum, o) => sum + o.amount, 0),
    orders: user.orders.map((o) => ({
      id: o.id,
      productName: o.product.namePl,
      variantName: o.variant.namePl,
      amount: o.amount,
      status: o.status,
      downloadCount: o.downloadCount,
      maxDownloads: o.maxDownloads,
      createdAt: o.createdAt,
    })),
  });
}
