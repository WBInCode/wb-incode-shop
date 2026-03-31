"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="border-t border-white/5 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold text-white">
                WB <span className="text-primary">InCode</span>
                <span className="text-gray-500 text-sm ml-1">Shop</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">{t("description")}</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t("nav")}</h4>
            <div className="space-y-3">
              <Link
                href={`/${locale}`}
                className="block text-gray-400 text-sm hover:text-primary transition-colors"
              >
                {t("nav")}
              </Link>
              <Link
                href={`/${locale}/templates`}
                className="block text-gray-400 text-sm hover:text-primary transition-colors"
              >
                {useTranslations("nav")("templates")}
              </Link>
              <Link
                href={`/${locale}/kontakt`}
                className="block text-gray-400 text-sm hover:text-primary transition-colors"
              >
                {t("contact")}
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t("legal")}</h4>
            <div className="space-y-3">
              <Link
                href={`/${locale}/polityka-prywatnosci`}
                className="block text-gray-400 text-sm hover:text-primary transition-colors"
              >
                {t("privacy")}
              </Link>
              <Link
                href={`/${locale}/regulamin`}
                className="block text-gray-400 text-sm hover:text-primary transition-colors"
              >
                {t("terms")}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} WB InCode. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
