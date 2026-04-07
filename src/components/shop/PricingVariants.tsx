"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Check, Star } from "lucide-react";
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

  // The most expensive variant gets "Popular" badge
  const maxPrice = Math.max(...variants.map((v) => v.price));

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">{t("variants")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
        {variants.map((variant, i) => {
          const name = locale === "pl" ? variant.namePl : variant.nameEn;
          const description =
            locale === "pl" ? variant.descriptionPl : variant.descriptionEn;
          const isSelected = selectedId === variant.id;
          const isPopular = variants.length > 1 && variant.price === maxPrice;

          return (
            <motion.button
              key={variant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelect(variant.id)}
              type="button"
              className={cn(
                "relative flex flex-col h-full p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group",
                isSelected
                  ? "border-primary bg-gradient-to-br from-primary/15 via-primary/5 to-transparent shadow-[0_0_24px_rgba(48,232,122,0.2)]"
                  : "border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06]"
              )}
            >
              {/* Popular badge */}
              {isPopular && (
                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary text-black text-[10px] font-bold rounded-full uppercase tracking-wide shadow">
                  <Star className="w-2.5 h-2.5" />
                  {locale === "pl" ? "Popularna" : "Popular"}
                </span>
              )}

              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={cn(
                    "font-bold text-sm leading-snug transition-colors",
                    isSelected ? "text-white" : "text-gray-200 group-hover:text-white"
                  )}
                >
                  {name}
                </span>
                {/* Radio circle */}
                <div
                  className={cn(
                    "flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-white/25 group-hover:border-primary/50"
                  )}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-black" strokeWidth={3} />
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed mb-4 pr-2 flex-1">
                {description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-2xl font-black tabular-nums transition-colors",
                    isSelected ? "text-primary" : "text-gray-300 group-hover:text-primary"
                  )}
                >
                  {locale === "pl"
                    ? formatPrice(variant.price)
                    : formatPriceEn(variant.price)}
                </span>
              </div>

              {/* Selected glow line */}
              {isSelected && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
