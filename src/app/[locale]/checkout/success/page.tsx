import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getPayUOrderStatus } from "@/lib/payu";
import { CheckCircle2, XCircle, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ token?: string; error?: string }>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const t = await getTranslations("success");
  const locale = await getLocale();
  const token = sp?.token;
  const errorCode = sp?.error;

  // PayU sends error=000 for success — anything else means failure/cancellation
  const payuReportedFailure = errorCode !== undefined && errorCode !== "000";

  let order = null;
  let isPaid = false;

  if (token) {
    order = await prisma.order.findUnique({
      where: { downloadToken: token },
      include: { product: true, variant: true },
    });

    if (order) {
      // If already PAID — great
      if (order.status === "PAID") {
        isPaid = true;
      }
      // If PENDING — check PayU for actual status (webhook may not have arrived yet)
      else if (order.status === "PENDING" && order.payuOrderId && !payuReportedFailure) {
        const payuStatus = await getPayUOrderStatus(order.payuOrderId);
        if (payuStatus === "COMPLETED") {
          order = await prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
            include: { product: true, variant: true },
          });
          isPaid = true;
        } else if (
          payuStatus === "CANCELED" ||
          payuStatus === "REJECTED" ||
          payuStatus === "WAITING_FOR_CONFIRMATION"
        ) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" },
          });
        }
      }
    }
  }

  // If PayU flagged failure OR order is not paid — redirect to cancel page
  if (payuReportedFailure || (order && !isPaid)) {
    redirect(`/${locale}/checkout/cancel`);
  }

  // No valid token at all
  if (!token || !order) {
    redirect(`/${locale}/templates`);
  }

  return (
    <section className="pt-28 pb-24 min-h-[70vh] flex items-center">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-400 text-lg mb-8">{t("subtitle")}</p>

        <a
          href={`/api/download/${token}`}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:shadow-[0_0_30px_rgba(48,232,122,0.4)] transition-all mb-4"
        >
          <Download className="w-5 h-5" />
          {t("download")}
        </a>

        <p className="text-gray-500 text-sm mb-2">{t("emailSent")}</p>
        <p className="text-gray-600 text-xs mb-8">{t("note")}</p>

        <Link
          href={`/${locale}/templates`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToShop")}
        </Link>
      </div>
    </section>
  );
}
