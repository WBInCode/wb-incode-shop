import crypto from "crypto";

const PAYU_BASE_URL = process.env.PAYU_BASE_URL || "https://secure.snd.payu.com";
const PAYU_POS_ID = process.env.PAYU_POS_ID || "";
const PAYU_CLIENT_ID = process.env.PAYU_CLIENT_ID || "";
const PAYU_CLIENT_SECRET = process.env.PAYU_CLIENT_SECRET || "";
const PAYU_MD5_KEY = process.env.PAYU_MD5_KEY || "";

async function getAccessToken(): Promise<string> {
  const response = await fetch(`${PAYU_BASE_URL}/pl/standard/user/oauth/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: PAYU_CLIENT_ID,
      client_secret: PAYU_CLIENT_SECRET,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export interface PayUOrderRequest {
  extOrderId: string;
  description: string;
  totalAmount: number; // in grosze
  currencyCode: string;
  buyerEmail: string;
  continueUrl: string;
  notifyUrl: string;
}

export async function createPayUOrder(order: PayUOrderRequest): Promise<{ redirectUri: string; orderId: string }> {
  const accessToken = await getAccessToken();

  const body = {
    notifyUrl: order.notifyUrl,
    continueUrl: order.continueUrl,
    customerIp: "127.0.0.1",
    merchantPosId: PAYU_POS_ID,
    description: order.description,
    currencyCode: order.currencyCode,
    totalAmount: order.totalAmount.toString(),
    extOrderId: order.extOrderId,
    buyer: {
      email: order.buyerEmail,
    },
    products: [
      {
        name: order.description,
        unitPrice: order.totalAmount.toString(),
        quantity: "1",
      },
    ],
  };

  const response = await fetch(`${PAYU_BASE_URL}/api/v2_1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });

  if (response.status === 302) {
    const redirectUri = response.headers.get("Location") || "";
    const orderId = redirectUri.split("orderId=")[1]?.split("&")[0] || "";
    return { redirectUri, orderId };
  }

  const data = await response.json();
  if (data.redirectUri) {
    return { redirectUri: data.redirectUri, orderId: data.orderId };
  }

  throw new Error(`PayU order creation failed: ${JSON.stringify(data)}`);
}

export async function getPayUOrderStatus(payuOrderId: string): Promise<string | null> {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYU_BASE_URL}/api/v2_1/orders/${payuOrderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const order = data.orders?.[0];
    return order?.status || null;
  } catch {
    return null;
  }
}

export function verifyPayUSignature(body: string, signature: string): boolean {
  const parts = signature.split(";").reduce((acc: Record<string, string>, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const algorithm = parts["algorithm"] === "SHA-256" ? "sha256" : "md5";
  const expectedSignature = parts["signature"];

  const concatenated = body + PAYU_MD5_KEY;
  const computed = crypto.createHash(algorithm).update(concatenated, "utf8").digest("hex");

  return computed === expectedSignature;
}
