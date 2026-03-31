import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyGateSignature(value: string): Promise<boolean> {
  const secret = process.env.ADMIN_GATE_TOKEN || "";
  if (!secret || value.length !== 64) return false;
  const day = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const [expected, expectedYesterday] = await Promise.all([
    hmacHex(secret, day),
    hmacHex(secret, yesterday),
  ]);
  return timingSafeEqual(value, expected) || timingSafeEqual(value, expectedYesterday);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for admin routes and API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    // Protect all admin routes (except gate page itself) with gate cookie check
    if (
      pathname.startsWith("/admin") &&
      !pathname.startsWith("/admin/gate")
    ) {
      const gateCookie = request.cookies.get("admin-gate-passed");
      if (!gateCookie || !(await verifyGateSignature(gateCookie.value))) {
        return NextResponse.redirect(new URL("/admin/gate", request.url));
      }
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|favicon\\.ico|img|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp).*)",
  ],
};
