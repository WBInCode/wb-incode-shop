import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
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

  const paidOrders = user.orders.filter((o: { status: string }) => o.status === "PAID");

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: user.isActive,
    createdAt: user.createdAt,
    ordersCount: paidOrders.length,
    totalSpent: paidOrders.reduce((sum: number, o: { amount: number }) => sum + o.amount, 0),
    orders: user.orders.map((o: { id: string; product: { namePl: string }; variant: { namePl: string }; amount: number; status: string; createdAt: Date }) => ({
      id: o.id,
      productName: o.product.namePl,
      variantName: o.variant.namePl,
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt,
    })),
  });
}

// Admin actions: reset-password, deactivate, activate, delete
export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await req.json();

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  switch (action) {
    case "reset-password": {
      // Delete old tokens for this email
      await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          email: user.email,
          token,
          expiresAt: new Date(Date.now() + 3600000), // 1h
        },
      });

      await sendPasswordResetEmail(user.email, token);

      return NextResponse.json({ success: true, message: "Link do resetowania hasła został wysłany" });
    }

    case "deactivate": {
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, message: "Konto zostało dezaktywowane" });
    }

    case "activate": {
      await prisma.user.update({
        where: { id },
        data: { isActive: true },
      });
      return NextResponse.json({ success: true, message: "Konto zostało aktywowane" });
    }

    case "delete": {
      // Unlink orders from user (keep order history)
      await prisma.order.updateMany({
        where: { userId: id },
        data: { userId: null },
      });
      await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Konto zostało usunięte" });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
