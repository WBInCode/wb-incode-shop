import { getTranslations, getLocale } from "next-intl/server";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

export default async function CheckoutCancelPage() {
  const t = await getTranslations("cancel");
  const locale = await getLocale();

  return (
    <section className="pt-28 pb-24 min-h-[70vh] flex items-center">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-400 text-lg mb-8">{t("subtitle")}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/templates`}
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 bg-white/5 rounded-full text-white font-semibold hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToShop")}
          </Link>
        </div>
      </div>
    </section>
  );
}
