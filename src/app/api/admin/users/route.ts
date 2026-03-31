import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    include: {
      orders: {
        where: { status: "PAID" },
        select: { amount: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const usersWithStats = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    ordersCount: user.orders.length,
    totalSpent: user.orders.reduce((sum, o) => sum + o.amount, 0),
  }));

  return NextResponse.json(usersWithStats);
}
