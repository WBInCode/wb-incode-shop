import { NextRequest, NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import JSZip from "jszip";

const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".htm": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
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
  ".xml": "application/xml",
  ".txt": "text/plain",
};

function getContentType(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

// POST — upload & extract preview ZIP
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const slug = formData.get("slug") as string | null;

    if (!file || !slug) {
      return NextResponse.json(
        { error: "File and slug are required" },
        { status: 400 }
      );
    }

    if (file.size > MAX_ZIP_SIZE) {
      return NextResponse.json(
        { error: "ZIP too large (max 50MB)" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json(
        { error: "Only ZIP files are allowed" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete old preview files
    await deletePreviewFiles(slug);

    // Extract ZIP
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    // Find the root directory — ZIP may have a wrapper folder
    const entries = Object.keys(zip.files);
    let prefix = "";

    // Check if all files are inside a single folder
    const hasIndexAtRoot = entries.some(
      (e) => e === "index.html" || e === "index.htm"
    );
    if (!hasIndexAtRoot) {
      const topDirs = new Set(
        entries
          .filter((e) => e.includes("/"))
          .map((e) => e.split("/")[0])
      );
      if (topDirs.size === 1) {
        const dir = [...topDirs][0];
        const hasIndexInDir = entries.some(
          (e) => e === `${dir}/index.html` || e === `${dir}/index.htm`
        );
        if (hasIndexInDir) {
          prefix = `${dir}/`;
        }
      }
    }

    // Verify index.html exists
    const indexPath = `${prefix}index.html`;
    const indexPathHtm = `${prefix}index.htm`;
    if (!zip.files[indexPath] && !zip.files[indexPathHtm]) {
      return NextResponse.json(
        { error: "ZIP must contain index.html at root level" },
        { status: 400 }
      );
    }

    // Upload all files to Vercel Blob
    let fileCount = 0;
    let previewUrl = "";
    const uploadPromises: Promise<void>[] = [];

    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;

      // Skip files outside the detected root
      if (prefix && !path.startsWith(prefix)) continue;

      // Remove the prefix to get the relative path
      const relativePath = prefix ? path.substring(prefix.length) : path;
      if (!relativePath) continue;

      // Sanitize path — prevent directory traversal
      const sanitized = relativePath
        .split("/")
        .filter((seg) => seg !== ".." && seg !== ".")
        .join("/");
      if (!sanitized) continue;

      const blobPath = `previews/${slug}/${sanitized}`;
      const contentType = getContentType(sanitized);

      const uploadFn = async () => {
        const content = await zipEntry.async("nodebuffer");
        const blob = await put(blobPath, content, {
          access: "public",
          contentType,
          addRandomSuffix: false,
        });

        if (
          sanitized === "index.html" ||
          sanitized === "index.htm"
        ) {
          previewUrl = blob.url;
        }
        fileCount++;
      };

      uploadPromises.push(uploadFn());
    }

    // Upload in batches of 10 to avoid overwhelming the API
    const BATCH_SIZE = 10;
    for (let i = 0; i < uploadPromises.length; i += BATCH_SIZE) {
      await Promise.all(uploadPromises.slice(i, i + BATCH_SIZE));
    }

    if (!previewUrl) {
      return NextResponse.json(
        { error: "Failed to find index.html in upload" },
        { status: 500 }
      );
    }

    // Update product with preview URL
    await prisma.product.update({
      where: { slug },
      data: { previewUrl },
    });

    return NextResponse.json({
      previewUrl,
      fileCount,
    });
  } catch (error) {
    console.error("Preview upload error:", error);
    return NextResponse.json(
      { error: "Preview upload failed" },
      { status: 500 }
    );
  }
}

// DELETE — remove preview files and clear previewUrl
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    await deletePreviewFiles(slug);

    await prisma.product.update({
      where: { slug },
      data: { previewUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Preview delete error:", error);
    return NextResponse.json(
      { error: "Preview delete failed" },
      { status: 500 }
    );
  }
}

async function deletePreviewFiles(slug: string) {
  const prefix = `previews/${slug}/`;
  let cursor: string | undefined;

  do {
    const result = await list({ prefix, cursor });
    if (result.blobs.length > 0) {
      await del(result.blobs.map((b) => b.url));
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);
}
