import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = Promise<{ slug: string }>;

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
    // Fetch the HTML from Vercel Blob
    const response = await fetch(product.previewUrl);

    if (!response.ok) {
      return new NextResponse("Failed to load preview", { status: 502 });
    }

    let html = await response.text();

    // Rewrite relative asset paths to point to the Blob base URL
    // e.g. previewUrl = https://xxx.blob.vercel-storage.com/previews/slug/index.html
    // base = https://xxx.blob.vercel-storage.com/previews/slug/
    const baseUrl = product.previewUrl.substring(
      0,
      product.previewUrl.lastIndexOf("/") + 1
    );

    // Inject a <base> tag so relative URLs resolve against the Blob storage
    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="${baseUrl}">`
    );

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
