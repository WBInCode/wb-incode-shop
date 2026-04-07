"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useLocale } from "next-intl";
import { formatPrice, formatPriceEn } from "@/lib/utils";

export interface Addon {
  id: string;
  namePl: string;
  nameEn: string;
  descriptionPl: string | null;
  descriptionEn: string | null;
  price: number;
  originalPrice: number | null;
  currency: string;
  required: boolean;
  badgePl: string | null;
  badgeEn: string | null;
}

interface AddonsSelectorProps {
  addons: Addon[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function TooltipIcon({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <button
        type="button"
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="Więcej informacji"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {visible && (
        <span
          className="fixed z-[9999] w-64 bg-gray-900 border border-white/15 text-gray-200 text-xs rounded-xl p-3 shadow-2xl pointer-events-none"
          style={{ transform: "translate(8px, -50%)", marginTop: "0.6rem" }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

export default function AddonsSelector({
  addons,
  selectedIds,
  onChange,
}: AddonsSelectorProps) {
  const locale = useLocale();

  // The last addon (highest sortOrder) is the all-inclusive complete package
  const completeAddon = addons[addons.length - 1];
  const isCompleteSelected = !!(completeAddon && selectedIds.includes(completeAddon.id));

  const toggle = (id: string, required: boolean) => {
    if (required) return;
    // If complete package is selected, only allow deselecting it — block all others
    if (isCompleteSelected && id !== completeAddon.id) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (!addons.length) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {locale === "pl" ? "Usługi dodatkowe" : "Add-on services"}
      </h4>
      <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
        {addons.map((addon) => {
          const isSelected = selectedIds.includes(addon.id);
          const isComplete = addon.id === completeAddon?.id;
          const isBlocked = isCompleteSelected && !isComplete;
          const name = locale === "pl" ? addon.namePl : addon.nameEn;
          const description =
            locale === "pl" ? addon.descriptionPl : addon.descriptionEn;
          const badge = locale === "pl" ? addon.badgePl : addon.badgeEn;
          const fmt = locale === "pl" ? formatPrice : formatPriceEn;

          return (
            <div
              key={addon.id}
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isBlocked}
              tabIndex={addon.required || isBlocked ? -1 : 0}
              className={`flex items-center gap-3 px-4 py-3 transition-colors select-none ${
                addon.required || isBlocked
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer hover:bg-white/5"
              } ${isSelected ? "bg-white/[0.03]" : ""}`}
              onClick={() => toggle(addon.id, addon.required)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggle(addon.id, addon.required);
                }
              }}
            >
              {/* Checkbox */}
              <span
                className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-all ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-white/20 bg-white/5"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-black"
                    fill="none"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              {/* Name + description tooltip */}
              <span className="flex-1 min-w-0">
                <span
                  className={`flex items-center gap-1.5 text-sm ${
                    isSelected ? "font-semibold text-white" : "text-gray-300"
                  }`}
                >
                  <span className="truncate">{name}</span>
                  {description && <TooltipIcon text={description} />}
                </span>
              </span>

              {/* Badge */}
              {badge && (
                <span className="hidden sm:inline-flex flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 whitespace-nowrap">
                  {badge}
                </span>
              )}

              {/* Prices */}
              <span className="flex-shrink-0 flex items-center gap-2 ml-2">
                {addon.originalPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    {fmt(addon.originalPrice)}
                  </span>
                )}
                <span
                  className={`text-sm font-bold ${
                    isSelected ? "text-primary" : "text-gray-300"
                  }`}
                >
                  {fmt(addon.price)}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
