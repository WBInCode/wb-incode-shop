import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role?: string }).role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Imię jest wymagane." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd." },
      { status: 500 }
    );
  }
}
