import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

function generateGateSignature(): string {
  const secret = process.env.ADMIN_GATE_TOKEN || "";
  const day = new Date().toISOString().split("T")[0]; // rotates daily
  return createHmac("sha256", secret).update(day).digest("hex");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token } = body;

  if (!token || token !== process.env.ADMIN_GATE_TOKEN) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const signature = generateGateSignature();

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin-gate-passed", signature, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}
