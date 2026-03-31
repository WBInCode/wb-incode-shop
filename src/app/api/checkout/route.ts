import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPayUOrder } from "@/lib/payu";
import { generateDownloadToken } from "@/lib/download";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productSlug, variantId, locale } = body;

    if (!email || !productSlug || !variantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find product and variant
    const product = await prisma.product.findUnique({
      where: { slug: productSlug, active: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const variant = await prisma.variant.findFirst({
      where: { id: variantId, productId: product.id, active: true },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Create order
    const downloadToken = generateDownloadToken();

    // If customer is logged in, attach userId
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    const userId = role === "customer" ? session?.user?.id : undefined;

    const order = await prisma.order.create({
      data: {
        email,
        productId: product.id,
        variantId: variant.id,
        amount: variant.price,
        currency: variant.currency,
        downloadToken,
        ...(userId ? { userId } : {}),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const currentLocale = locale || "pl";

    // Create PayU order
    const payuOrder = await createPayUOrder({
      extOrderId: order.id,
      description: locale === "pl" ? product.namePl : product.nameEn,
      totalAmount: variant.price,
      currencyCode: variant.currency,
      buyerEmail: email,
      continueUrl: `${appUrl}/${currentLocale}/checkout/success?token=${downloadToken}`,
      notifyUrl: `${appUrl}/api/payu/notify`,
    });

    // Update order with PayU order ID
    await prisma.order.update({
      where: { id: order.id },
      data: { payuOrderId: payuOrder.orderId },
    });

    return NextResponse.json({ redirectUrl: payuOrder.redirectUri });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
