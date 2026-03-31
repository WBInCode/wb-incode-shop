import { auth } from "@/lib/auth";
import { getTranslations, getLocale } from "next-intl/server";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { FileCheck, ShieldCheck } from "lucide-react";

export default async function AccountLicensesPage() {
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
        <FileCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">{t("noPurchases")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: typeof orders[number]) => {
        const productName = locale === "en" ? order.product.nameEn : order.product.namePl;
        const variantName = locale === "en" ? order.variant.nameEn : order.variant.namePl;
        const isPersonal = variantName.toLowerCase().includes("personal");

        return (
          <div
            key={order.id}
            className="bg-surface border border-white/5 rounded-2xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-white font-semibold">{productName}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">{variantName}</p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{t("licenseType")}</p>
                  <p className="text-sm text-gray-300">
                    {isPersonal ? t("licensePersonal") : t("licenseCommercial")}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-primary font-semibold">{formatPrice(order.amount)}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(order.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "pl-PL")}
                </p>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium mt-2 bg-emerald-400/10 text-emerald-400">
                  {t("licenseActive")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
