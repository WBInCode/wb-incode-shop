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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Oba pola hasła są wymagane." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Nowe hasło musi mieć minimum 8 znaków." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isValid = await bcryptjs.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Obecne hasło jest nieprawidłowe." },
        { status: 400 }
      );
    }

    const passwordHash = await bcryptjs.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd." },
      { status: 500 }
    );
  }
}
