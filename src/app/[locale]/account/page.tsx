import { auth } from "@/lib/auth";
import { getTranslations, getLocale } from "next-intl/server";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Download, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-400/10 text-emerald-400",
  PENDING: "bg-yellow-400/10 text-yellow-400",
  CANCELLED: "bg-red-400/10 text-red-400",
  REFUNDED: "bg-blue-400/10 text-blue-400",
};

export default async function AccountPurchasesPage() {
  const session = await auth();
  const t = await getTranslations("account");
  const locale = await getLocale();

  const orders = await prisma.order.findMany({
    where: { userId: session!.user!.id, status: "PAID" },
    include: { product: true, variant: true },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="bg-surface border border-white/5 rounded-2xl p-12 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-6">{t("noPurchases")}</p>
        <Link
          href={`/${locale}/templates`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:shadow-[0_0_30px_rgba(48,232,122,0.4)] transition-all"
        >
          {t("browsProducts")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">{t("product")}</th>
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">{t("variant")}</th>
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">{t("amount")}</th>
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">{t("date")}</th>
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">{t("downloads")}</th>
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isExpired = order.downloadExpiresAt < new Date();
              const canDownload = !isExpired && order.downloadCount < order.maxDownloads;
              const productName = locale === "en" ? order.product.nameEn : order.product.namePl;
              const variantName = locale === "en" ? order.variant.nameEn : order.variant.namePl;

              return (
                <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-white text-sm font-medium">{productName}</td>
                  <td className="py-4 px-6 text-gray-400 text-sm">{variantName}</td>
                  <td className="py-4 px-6 text-primary font-medium text-sm">{formatPrice(order.amount)}</td>
                  <td className="py-4 px-6 text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "pl-PL")}
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-sm">
                    {order.downloadCount}/{order.maxDownloads}
                  </td>
                  <td className="py-4 px-6">
                    {canDownload ? (
                      <a
                        href={`/api/download/${order.downloadToken}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t("download")}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-600">{t("expired")}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
