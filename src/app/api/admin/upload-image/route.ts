import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large (max 10MB)" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, GIF and AVIF images are allowed" },
        { status: 400 }
      );
    }

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .toLowerCase();
    const blobName = `screenshots/${Date.now()}-${safeName}`;

    const blob = await put(blobName, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Image upload failed" },
      { status: 500 }
    );
  }
}
