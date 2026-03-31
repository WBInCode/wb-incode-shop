"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, ShieldCheck } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatPrice, formatPriceEn } from "@/lib/utils";
import Link from "next/link";

interface CheckoutFormProps {
  productSlug: string;
  variantId: string;
  variantName: string;
  price: number;
}

export default function CheckoutForm({
  productSlug,
  variantId,
  variantName,
  price,
}: CheckoutFormProps) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productSlug,
          variantId,
          locale,
        }),
      });

      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError(t("error"));
        setLoading(false);
      }
    } catch {
      setError(t("error"));
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="relative">
        <h3 className="text-2xl font-bold text-white mb-6">{t("title")}</h3>

        {/* Order summary */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">{t("variant")}</span>
            <span className="text-white font-medium">{variantName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{t("total")}</span>
            <span className="text-primary font-bold text-xl">
              {locale === "pl" ? formatPrice(price) : formatPriceEn(price)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t("email")}</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              required
            />
            <p className="text-xs text-gray-500 mt-2">{t("emailHint")}</p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("processing")}
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                {t("pay")}
              </>
            )}
          </Button>

          {error && (
            <p className="text-red-400 text-sm text-center mt-2">{error}</p>
          )}
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          {t("terms")}{" "}
          <Link
            href={`/${locale}/regulamin`}
            className="text-primary hover:underline"
          >
            {t("termsLink")}
          </Link>{" "}
          &{" "}
          <Link
            href={`/${locale}/polityka-prywatnosci`}
            className="text-primary hover:underline"
          >
            {t("privacyLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
