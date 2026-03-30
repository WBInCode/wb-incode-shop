import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

type Params = Promise<{ token: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { token } = await params;

    const order = await prisma.order.findUnique({
      where: { downloadToken: token },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Invalid download token" },
        { status: 404 }
      );
    }

    // Check if order is paid
    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: "Order not yet paid" },
        { status: 403 }
      );
    }

    // Check download expiry
    if (new Date() > order.downloadExpiresAt) {
      return NextResponse.json(
        { error: "Download link has expired" },
        { status: 410 }
      );
    }

    // Check download count
    if (order.downloadCount >= order.maxDownloads) {
      return NextResponse.json(
        { error: "Maximum download limit reached" },
        { status: 429 }
      );
    }

    // Increment download count
    await prisma.order.update({
      where: { id: order.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Read and serve the file
    const filePath = path.join(process.cwd(), "uploads", order.product.fileUrl);
    const fileBuffer = await readFile(filePath);
    const fileName = path.basename(order.product.fileUrl);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
