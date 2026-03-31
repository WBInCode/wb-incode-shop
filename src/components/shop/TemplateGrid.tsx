"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import TemplateCard from "./TemplateCard";

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

interface TemplateGridProps {
  products: Product[];
}

export default function TemplateGrid({ products }: TemplateGridProps) {
  const t = useTranslations("templates");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(
      products.map((p) => (locale === "pl" ? p.categoryPl : p.categoryEn))
    );
    const preferredOrder = locale === "pl"
      ? ["Szablon Strony", "Szablony Strony WordPress", "Wtyczki", "Skrypty", "Narzędzia", "Twój Pomysł"]
      : ["Website Template", "WordPress Templates", "Plugins", "Scripts", "Tools", "Your Idea"];
    return Array.from(cats).sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [products, locale]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const name = locale === "pl" ? p.namePl : p.nameEn;
      const category = locale === "pl" ? p.categoryPl : p.categoryEn;
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory, locale]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
            }`}
          >
            {t("allCategories")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product, i) => (
            <TemplateCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-gray-500 text-lg">{t("noResults")}</p>
        </motion.div>
      )}
    </div>
  );
}
