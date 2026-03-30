import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceInGrosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(priceInGrosze / 100);
}

export function formatPriceEn(priceInGrosze: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PLN",
  }).format(priceInGrosze / 100);
}

export function parseJsonArray(value: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseProductArrays<T extends Record<string, any>>(product: T): T & { technologies: string[]; screenshots: string[] } {
  return {
    ...product,
    technologies: parseJsonArray(product.technologies),
    screenshots: parseJsonArray(product.screenshots),
  };
}
