import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = Promise<{ path: string[] }>;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function getMimeType(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return "application/octet-stream";
  const ext = filename.substring(dot).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Rewrite relative paths in HTML to proxy-relative absolute paths.
 * Everything goes through the proxy — no direct Blob URLs.
 * Leaves #anchors, absolute URLs, and special protocols untouched.
 */
function rewriteToProxy(html: string, proxyBase: string): string {
  // src="relative", srcset="relative", action="relative" — double quotes
  html = html.replace(
    /(\s(?:src|srcset|action))="(?![a-z][a-z0-9+.-]*:|\/\/|#|\/)([^"]+)"/gi,
    (_, attr, path) => `${attr}="${proxyBase}${path}"`
  );
  // Same for single quotes
  html = html.replace(
    /(\s(?:src|srcset|action))='(?![a-z][a-z0-9+.-]*:|\/\/|#|\/)([^']+)'/gi,
    (_, attr, path) => `${attr}='${proxyBase}${path}'`
  );

  // href="relative" — skip #anchors, /absolute, any-scheme:, //protocol-relative
  html = html.replace(
    /(\shref)="(?![a-z][a-z0-9+.-]*:|\/\/|#|\/)([^"]+)"/gi,
    (_, attr, path) => `${attr}="${proxyBase}${path}"`
  );
  html = html.replace(
    /(\shref)='(?![a-z][a-z0-9+.-]*:|\/\/|#|\/)([^']+)'/gi,
    (_, attr, path) => `${attr}='${proxyBase}${path}'`
  );

  // url() in inline <style> blocks — skip schemes, data:, #, /
  html = html.replace(
    /url\((['"]?)(?![a-z][a-z0-9+.-]*:|\/\/|#|\/)([^'")]+)\1\)/gi,
    (_, quote, path) => `url(${quote}${proxyBase}${path}${quote})`
  );

  return html;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const slug = path[0];
  const filePath = path.length > 1 ? path.slice(1).join("/") : null;

  // Sanitize path — prevent directory traversal
  if (filePath) {
    const segments = filePath.split("/");
    if (segments.some((s) => s === ".." || s === ".")) {
      return new NextResponse("Invalid path", { status: 400 });
    }
  }

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { previewUrl: true },
  });

  if (!product?.previewUrl) {
    return new NextResponse("Preview not found", { status: 404 });
  }

  // Base URL = Blob directory containing index.html
  const baseUrl =
    product.previewUrl.substring(0, product.previewUrl.lastIndexOf("/") + 1);

  // Build Blob URL for the requested file
  const blobUrl = filePath ? `${baseUrl}${filePath}` : product.previewUrl;

  try {
    const response = await fetch(blobUrl);

    if (!response.ok) {
      return new NextResponse("File not found", { status: 404 });
    }

    const isHtml =
      !filePath || filePath.endsWith(".html") || filePath.endsWith(".htm");

    if (isHtml) {
      let html = await response.text();

      // Rewrite relative paths to proxy URLs (not Blob URLs)
      // This ensures all resources load through the proxy, avoiding
      // Blob's Content-Disposition: attachment and CORS issues.
      const proxyBase = `/api/preview/${slug}/`;
      html = rewriteToProxy(html, proxyBase);

      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      });
    }

    // Non-HTML resources: proxy with correct Content-Type and long cache
    const body = await response.arrayBuffer();
    const contentType = getMimeType(filePath);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch {
    return new NextResponse("Preview unavailable", { status: 500 });
  }
}
