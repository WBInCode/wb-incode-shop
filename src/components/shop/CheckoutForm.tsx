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
  const [wantInvoice, setWantInvoice] = useState(false);
  const [isCompany, setIsCompany] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyNip, setCompanyNip] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [personName, setPersonName] = useState("");
  const [personAddress, setPersonAddress] = useState("");
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
          wantInvoice,
          ...(wantInvoice && isCompany && { companyName, companyNip, companyAddress }),
          ...(wantInvoice && !isCompany && { personName, personAddress }),
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

          {/* Invoice option */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wantInvoice}
                onChange={(e) => setWantInvoice(e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-gray-300">{t("wantInvoice")}</span>
            </label>

            {wantInvoice && (
              <div className="mt-4 space-y-3">
                {/* Company / Person toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCompany(true)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isCompany
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 text-gray-400 border border-white/10"
                    }`}
                  >
                    {t("companyTab")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCompany(false)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      !isCompany
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 text-gray-400 border border-white/10"
                    }`}
                  >
                    {t("personTab")}
                  </button>
                </div>

                {isCompany ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t("companyName")}</label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={t("companyNamePlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t("companyNip")}</label>
                      <Input
                        value={companyNip}
                        onChange={(e) => setCompanyNip(e.target.value)}
                        placeholder={t("companyNipPlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t("companyAddress")}</label>
                      <Input
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder={t("companyAddressPlaceholder")}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t("personName")}</label>
                      <Input
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        placeholder={t("personNamePlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t("personAddress")}</label>
                      <Input
                        value={personAddress}
                        onChange={(e) => setPersonAddress(e.target.value)}
                        placeholder={t("personAddressPlaceholder")}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            )}
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
