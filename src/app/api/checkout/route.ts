import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { generateDownloadToken } from "@/lib/download";
import { auth } from "@/lib/auth";
import { auditLog, getClientIp } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productSlug, variantId, locale, addonIds, wantInvoice, isCompany, companyName, companyNip, companyAddress, personName, personAddress } = body;

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

    // Validate and fetch addons
    const safeAddonIds: string[] = Array.isArray(addonIds) ? addonIds : [];
    const addons = safeAddonIds.length > 0
      ? await prisma.addon.findMany({
          where: { id: { in: safeAddonIds }, productId: product.id, active: true },
        })
      : [];
    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const totalAmount = variant.price + addonsTotal;

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
        amount: totalAmount,
        currency: variant.currency,
        downloadToken,
        ...(userId ? { userId } : {}),
        wantInvoice: wantInvoice || false,
        isCompany: wantInvoice ? (isCompany ?? true) : true,
        companyName: wantInvoice && isCompany ? companyName : null,
        companyNip: wantInvoice && isCompany ? companyNip : null,
        companyAddress: wantInvoice && isCompany ? companyAddress : null,
        personName: wantInvoice && !isCompany ? personName : null,
        personAddress: wantInvoice && !isCompany ? personAddress : null,
        ...(addons.length > 0 ? {
          orderAddons: {
            create: addons.map((a) => ({ addonId: a.id, price: a.price })),
          },
        } : {}),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const currentLocale = locale || "pl";

    // Create Stripe Checkout Session
    const stripeSession = await createStripeCheckoutSession({
      orderId: order.id,
      productName: locale === "pl" ? product.namePl : product.nameEn,
      amount: totalAmount,
      currency: variant.currency,
      buyerEmail: email,
      successUrl: `${appUrl}/${currentLocale}/checkout/success?token=${downloadToken}`,
      cancelUrl: `${appUrl}/${currentLocale}/checkout/cancel`,
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.sessionId },
    });

    await auditLog({
      action: "order.create",
      entity: "order",
      entityId: order.id,
      actor: email,
      actorType: "customer",
      details: { productSlug, variantId, amount: totalAmount, addonIds: addons.map((a) => a.id) },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ redirectUrl: stripeSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
