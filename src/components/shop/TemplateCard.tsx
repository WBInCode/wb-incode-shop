"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatPriceEn } from "@/lib/utils";

interface Product {
  id: string;
  slug: string;
  namePl: string;
  nameEn: string;
  descriptionPl: string;
  descriptionEn: string;
  categoryPl: string;
  categoryEn: string;
  technologies: string[];
  screenshots: string[];
  variants: { price: number }[];
}

interface TemplateCardProps {
  product: Product;
  index?: number;
}

const gradients = [
  "from-violet-600/20 to-indigo-600/20",
  "from-blue-600/20 to-cyan-500/20",
  "from-emerald-500/20 to-teal-500/20",
  "from-amber-500/20 to-orange-600/20",
  "from-pink-500/20 to-rose-500/20",
  "from-purple-500/20 to-fuchsia-500/20",
];

export default function TemplateCard({ product, index = 0 }: TemplateCardProps) {
  const t = useTranslations("templates");
  const locale = useLocale();

  const name = locale === "pl" ? product.namePl : product.nameEn;
  const category = locale === "pl" ? product.categoryPl : product.categoryEn;
  const minPrice = product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.price))
    : 0;
  const gradient = gradients[index % gradients.length];
  const screenshot = product.screenshots[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Link
        href={`/${locale}/templates/${product.slug}`}
        className="group flex flex-col h-full rounded-2xl bg-surface border border-white/5 overflow-hidden hover:border-primary/20 transition-all duration-500"
      >
        {/* Image */}
        <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${gradient}`}>
          {screenshot ? (
            <Image
              src={screenshot}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl font-black text-white/20">{name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="primary">{category}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors flex-1">
            {name}
          </h3>

          {/* Technologies */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">
              {t("priceFrom")}{" "}
              <span className="text-primary font-bold text-lg">
                {locale === "pl" ? formatPrice(minPrice) : formatPriceEn(minPrice)}
              </span>
            </span>
            <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">
              {t("details")} →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
