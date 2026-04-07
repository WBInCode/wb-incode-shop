import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = Promise<{ slug: string }>;

// Rewrite relative asset/link paths in HTML to absolute Blob URLs.
// Leaves anchor hrefs (#section), absolute paths (/path), absolute URLs (http/https) untouched.
function rewritePaths(html: string, baseUrl: string): string {
  // src="relative/path" → src="baseUrl/relative/path"
  html = html.replace(
    /(\s(?:src|srcset|action))="(?!https?:\/\/|\/\/|data:|#|\/)([^"]*)"/gi,
    (_, attr, path) => `${attr}="${baseUrl}${path}"`
  );
  html = html.replace(
    /(\s(?:src|srcset|action))='(?!https?:\/\/|\/\/|data:|#|\/)([^']*)'/gi,
    (_, attr, path) => `${attr}='${baseUrl}${path}'`
  );

  // href="relative/path" — skip anchors (#), absolute paths (/), absolute URLs (http/https), mailto:, tel:, javascript:
  html = html.replace(
    /(\shref)="(?!https?:\/\/|\/\/|#|mailto:|tel:|javascript:|data:|\/|)([^"]*)"/gi,
    (_, attr, path) => `${attr}="${baseUrl}${path}"`
  );
  html = html.replace(
    /(\shref)='(?!https?:\/\/|\/\/|#|mailto:|tel:|javascript:|data:|\/|)([^']*)'/gi,
    (_, attr, path) => `${attr}='${baseUrl}${path}'`
  );

  // url('relative') or url("relative") in inline styles / style blocks
  html = html.replace(
    /url\((['"]?)(?!https?:\/\/|\/\/|data:|#|\/)([^'")]+)\1\)/gi,
    (_, quote, path) => `url(${quote}${baseUrl}${path}${quote})`
  );

  return html;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { previewUrl: true },
  });

  if (!product?.previewUrl) {
    return new NextResponse("Preview not found", { status: 404 });
  }

  try {
    const response = await fetch(product.previewUrl);

    if (!response.ok) {
      return new NextResponse("Failed to load preview", { status: 502 });
    }

    let html = await response.text();

    // Base URL for relative assets: directory containing index.html on Blob
    const baseUrl =
      product.previewUrl.substring(0, product.previewUrl.lastIndexOf("/") + 1);

    // Rewrite relative paths to absolute Blob URLs (no <base> tag — it breaks anchor navigation)
    html = rewritePaths(html, baseUrl);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse("Preview unavailable", { status: 500 });
  }
}

