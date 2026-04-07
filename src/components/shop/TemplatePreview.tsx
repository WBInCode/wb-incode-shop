"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Monitor, Tablet, Smartphone, ShoppingCart } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

type ViewMode = "desktop" | "tablet" | "mobile";

const VIEW_CONFIGS: Record<ViewMode, { width: number; icon: typeof Monitor; label: string }> = {
  desktop: { width: 1440, icon: Monitor, label: "Desktop" },
  tablet: { width: 768, icon: Tablet, label: "Tablet" },
  mobile: { width: 375, icon: Smartphone, label: "Mobile" },
};

interface TemplatePreviewProps {
  previewUrl: string;
  productName: string;
  productSlug: string;
}

export default function TemplatePreview({ previewUrl, productName, productSlug }: TemplatePreviewProps) {
  const t = useTranslations("preview");
  const locale = useLocale();
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [loading, setLoading] = useState(true);

  const handleIframeLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const config = VIEW_CONFIGS[viewMode];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 bg-surface border-b border-white/10 flex-shrink-0">
        {/* Left — back + name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/${locale}/templates/${productSlug}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("back")}</span>
          </Link>
          <div className="w-px h-6 bg-white/10 hidden sm:block" />
          <span className="text-white text-sm font-medium truncate hidden sm:block">
            {productName}
          </span>
        </div>

        {/* Center — responsive switcher */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {(Object.keys(VIEW_CONFIGS) as ViewMode[]).map((mode) => {
            const Icon = VIEW_CONFIGS[mode].icon;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === mode
                    ? "bg-primary/20 text-primary"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{VIEW_CONFIGS[mode].label}</span>
              </button>
            );
          })}
        </div>

        {/* Right — buy CTA */}
        <Link
          href={`/${locale}/templates/${productSlug}`}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("buy")}</span>
        </Link>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-[#111]">
        <div
          className="relative transition-all duration-300 ease-out h-full"
          style={{
            width: viewMode === "desktop" ? "100%" : `${config.width}px`,
            maxWidth: "100%",
          }}
        >
          {/* Loading skeleton */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111] z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm text-gray-500">{t("loading")}</span>
              </div>
            </div>
          )}

          <iframe
            src={previewUrl}
            title={`${productName} preview`}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}
