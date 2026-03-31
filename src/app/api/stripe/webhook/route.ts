import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { constructStripeEvent } from "@/lib/stripe";
import { sendDownloadEmail } from "@/lib/email";
import { createInvoice } from "@/lib/fakturownia";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    // Verify Stripe webhook signature
    let event;
    try {
      event = constructStripeEvent(rawBody, signature);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        return NextResponse.json({ error: "Missing orderId in metadata" }, { status: 400 });
      }

      // Find our order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { product: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Update order status
      if (order.status !== "PAID") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });

        // Send download email
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const downloadUrl = `${appUrl}/api/download/${order.downloadToken}`;

        try {
          await sendDownloadEmail(order.email, order.product.namePl, downloadUrl);
        } catch (emailError) {
          console.error("Failed to send download email:", emailError);
        }

        // Create invoice in Fakturownia (only if not already created)
        if (!order.invoiceCreated) {
          try {
            const isCompanyInvoice = order.wantInvoice && order.isCompany;
            const isPersonInvoice = order.wantInvoice && !order.isCompany;
            await createInvoice({
              buyerName: isCompanyInvoice && order.companyName
                ? order.companyName
                : isPersonInvoice && order.personName
                  ? order.personName
                  : order.email,
              buyerEmail: order.email,
              buyerTaxNo: isCompanyInvoice && order.companyNip ? order.companyNip : undefined,
              buyerAddress: isCompanyInvoice && order.companyAddress
                ? order.companyAddress
                : isPersonInvoice && order.personAddress
                  ? order.personAddress
                  : undefined,
              isCompany: order.wantInvoice ? order.isCompany : undefined,
              productName: order.product.namePl,
              quantity: 1,
              totalPriceGross: order.amount / 100,
              tax: 23,
              orderId: order.id,
              kind: order.wantInvoice ? "vat" : "receipt",
            });
            await prisma.order.update({
              where: { id: order.id },
              data: { invoiceCreated: true },
            });
          } catch (invoiceError) {
            console.error("Failed to create Fakturownia invoice:", invoiceError);
          }
        }
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
