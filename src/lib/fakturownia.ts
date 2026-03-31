const FAKTUROWNIA_API_TOKEN = process.env.FAKTUROWNIA_API_TOKEN || "";
const FAKTUROWNIA_DOMAIN = process.env.FAKTUROWNIA_DOMAIN || "";

export interface FakturowniaInvoiceData {
  buyerName: string;
  buyerEmail: string;
  buyerTaxNo?: string;
  buyerAddress?: string;
  isCompany?: boolean;
  productName: string;
  quantity: number;
  totalPriceGross: number; // in PLN (not grosze)
  tax: number; // e.g. 23
  orderId: string;
  kind: "vat" | "receipt"; // vat = faktura, receipt = paragon
}

export async function createInvoice(data: FakturowniaInvoiceData) {
  const today = new Date().toISOString().split("T")[0];

  const invoiceData: Record<string, unknown> = {
    kind: data.kind,
    number: null,
    sell_date: today,
    issue_date: today,
    payment_to: today,
    payment_type: "payu",
    status: "paid",
    paid_date: today,
    seller_name: "WB InCode Sp. z o.o.",
    buyer_name: data.buyerName,
    buyer_email: data.buyerEmail,
    oid: data.orderId,
    lang: "pl",
    currency: "PLN",
    positions: [
      {
        name: data.productName,
        tax: data.tax,
        total_price_gross: data.totalPriceGross,
        quantity: data.quantity,
      },
    ],
  };

  // Add buyer details for VAT invoices
  if (data.kind === "vat") {
    if (data.isCompany !== false && data.buyerTaxNo) {
      invoiceData.buyer_tax_no = data.buyerTaxNo;
    }
    if (data.buyerAddress) {
      invoiceData.buyer_street = data.buyerAddress;
    }
    if (data.isCompany === false) {
      invoiceData.buyer_company = false;
    }
  }

  const response = await fetch(`https://${FAKTUROWNIA_DOMAIN}/invoices.json`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_token: FAKTUROWNIA_API_TOKEN,
      invoice: invoiceData,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fakturownia API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
