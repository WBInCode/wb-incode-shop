import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

export interface StripeCheckoutRequest {
  orderId: string;
  productName: string;
  amount: number; // in grosze (PLN cents)
  currency: string;
  buyerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createStripeCheckoutSession(
  data: StripeCheckoutRequest
): Promise<{ sessionId: string; url: string }> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: data.buyerEmail,
    metadata: {
      orderId: data.orderId,
    },
    line_items: [
      {
        price_data: {
          currency: data.currency.toLowerCase(),
          product_data: {
            name: data.productName,
          },
          unit_amount: data.amount,
        },
        quantity: 1,
      },
    ],
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
  });

  if (!session.url) {
    throw new Error("Stripe session creation failed: no URL returned");
  }

  return { sessionId: session.id, url: session.url };
}

export async function getStripeSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}

export function constructStripeEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

export default stripe;
