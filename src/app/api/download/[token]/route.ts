import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPayUOrderStatus } from "@/lib/payu";

type Params = Promise<{ token: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { token } = await params;

    let order = await prisma.order.findUnique({
      where: { downloadToken: token },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Invalid download token" },
        { status: 404 }
      );
    }

    // If order is still PENDING, check PayU for updated status
    if (order.status === "PENDING" && order.payuOrderId) {
      const payuStatus = await getPayUOrderStatus(order.payuOrderId);
      if (payuStatus === "COMPLETED") {
        order = await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
          include: { product: true },
        });
      } else if (payuStatus === "CANCELED") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json(
          { error: "Order was cancelled" },
          { status: 403 }
        );
      }
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

    // Fetch file from Blob storage and proxy to client
    const fileUrl = order.product.fileUrl;
    const fileResponse = await fetch(fileUrl);

    if (!fileResponse.ok || !fileResponse.body) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const fileName = fileUrl.split("/").pop()?.split("?")[0] || "download.zip";

    return new NextResponse(fileResponse.body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
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
