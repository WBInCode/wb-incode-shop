import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStripeSession } from "@/lib/stripe";

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

    // If order is still PENDING, check Stripe for updated status
    if (order.status === "PENDING" && order.stripeSessionId) {
      const session = await getStripeSession(order.stripeSessionId);
      if (session?.payment_status === "paid") {
        order = await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
          include: { product: true },
        });
      } else if (session?.status === "expired") {
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
