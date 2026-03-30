import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for admin routes and API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    // Protect admin routes (except gate and login) with gate cookie check
    if (
      pathname.startsWith("/admin") &&
      !pathname.startsWith("/admin/gate") &&
      !pathname.startsWith("/admin/login")
    ) {
      const gateCookie = request.cookies.get("admin-gate-passed");
      if (!gateCookie || gateCookie.value !== "true") {
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
