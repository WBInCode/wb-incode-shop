"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Check } from "lucide-react";
import { formatPrice, formatPriceEn, cn } from "@/lib/utils";

interface Variant {
  id: string;
  namePl: string;
  nameEn: string;
  descriptionPl: string;
  descriptionEn: string;
  price: number;
}

interface PricingVariantsProps {
  variants: Variant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PricingVariants({
  variants,
  selectedId,
  onSelect,
}: PricingVariantsProps) {
  const t = useTranslations("templateDetail");
  const locale = useLocale();

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-6">{t("variants")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {variants.map((variant, i) => {
          const name = locale === "pl" ? variant.namePl : variant.nameEn;
          const description =
            locale === "pl" ? variant.descriptionPl : variant.descriptionEn;
          const isSelected = selectedId === variant.id;

          return (
            <motion.button
              key={variant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(variant.id)}
              className={cn(
                "p-6 rounded-2xl border text-left transition-all duration-300 cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(48,232,122,0.15)]"
                  : "border-white/10 bg-surface hover:border-primary/30"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-white">{name}</span>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-white/20"
                  )}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">{description}</p>
              <p className="text-2xl font-black text-primary">
                {locale === "pl"
                  ? formatPrice(variant.price)
                  : formatPriceEn(variant.price)}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
