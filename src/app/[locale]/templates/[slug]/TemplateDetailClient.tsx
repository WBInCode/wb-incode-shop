"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, X, Monitor } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import PricingVariants from "@/components/shop/PricingVariants";
import CheckoutForm from "@/components/shop/CheckoutForm";

interface Variant {
  id: string;
  namePl: string;
  nameEn: string;
  descriptionPl: string;
  descriptionEn: string;
  price: number;
}

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
  videoUrl?: string | null;
  variants: Variant[];
}

function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export default function TemplateDetailClient({ product }: { product: Product }) {
  const t = useTranslations("templateDetail");
  const locale = useLocale();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const name = locale === "pl" ? product.namePl : product.nameEn;
  const description = locale === "pl" ? product.descriptionPl : product.descriptionEn;
  const category = locale === "pl" ? product.categoryPl : product.categoryEn;

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const hasScreenshots = product.screenshots.length > 0;
  const videoEmbedUrl = product.videoUrl ? getVideoEmbedUrl(product.videoUrl) : null;

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/${locale}/templates`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("back")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left: screenshots + video + description */}
        <div className="lg:col-span-3">
          {/* Main screenshot / placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden border border-white/10 mb-4"
          >
            {hasScreenshots ? (
              <button
                onClick={() => setLightboxOpen(true)}
                className="w-full cursor-pointer"
                type="button"
              >
                <Image
                  src={product.screenshots[activeScreenshot]}
                  alt={name}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </button>
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/10 via-white/5 to-primary/5 flex flex-col items-center justify-center gap-3">
                <Monitor className="w-16 h-16 text-primary/30" />
                <span className="text-gray-500 text-sm">{name}</span>
              </div>
            )}
          </motion.div>

          {/* Thumbnail gallery */}
          {product.screenshots.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mb-8">
              {product.screenshots.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveScreenshot(i)}
                  className={`rounded-xl overflow-hidden border transition-colors cursor-pointer ${
                    i === activeScreenshot
                      ? "border-primary/50 ring-1 ring-primary/30"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${name} screenshot ${i + 1}`}
                    width={200}
                    height={130}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Video embed */}
          {videoEmbedUrl && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                {t("video")}
              </h3>
              <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video">
                <iframe
                  src={videoEmbedUrl}
                  title={`${name} video`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Direct video (non YouTube/Vimeo) */}
          {product.videoUrl && !videoEmbedUrl && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                {t("video")}
              </h3>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <video
                  src={product.videoUrl}
                  controls
                  className="w-full"
                  preload="metadata"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{t("description")}</h3>
            <p className="text-gray-400 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Technologies */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">{t("technologies")}</h3>
            <div className="flex flex-wrap gap-3">
              {product.technologies.map((tech) => (
                <Badge key={tech} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right: pricing + checkout */}
        <div className="lg:col-span-2">
          <div className="sticky top-28">
            {/* Title & category */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Badge variant="primary" className="mb-3">
                {category}
              </Badge>
              <h1 className="text-3xl font-black text-white">{name}</h1>
            </motion.div>

            {/* Pricing variants */}
            <div className="mb-8">
              <PricingVariants
                variants={product.variants}
                selectedId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            </div>

            {/* Checkout form */}
            {selectedVariant && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CheckoutForm
                  productSlug={product.slug}
                  variantId={selectedVariant.id}
                  variantName={
                    locale === "pl"
                      ? selectedVariant.namePl
                      : selectedVariant.nameEn
                  }
                  price={selectedVariant.price}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && hasScreenshots && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full"
            >
              <Image
                src={product.screenshots[activeScreenshot]}
                alt={name}
                width={1200}
                height={750}
                className="w-full h-auto rounded-xl"
              />
              {product.screenshots.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {product.screenshots.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveScreenshot(i)}
                      className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
                        i === activeScreenshot
                          ? "bg-primary"
                          : "bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
