/**
 * Seed category-specific addons for all products.
 * Run: npx tsx prisma/seed-addons.ts
 * WARNING: deletes and recreates all addons for each product.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Motyw WordPress / Motyw WooCommerce ──────────────────────────────────────
const WP_THEME_ADDONS = [
  {
    namePl: "Instalacja szablonu",
    nameEn: "Theme installation",
    descriptionPl: "Profesjonalna instalacja i konfiguracja szablonu na Twoim serwerze WordPress.",
    descriptionEn: "Professional theme installation and configuration on your WordPress server.",
    price: 18400,
    originalPrice: 22200,
    required: false, badgePl: null, badgeEn: null, sortOrder: 0,
  },
  {
    namePl: "Wymagane wtyczki",
    nameEn: "Required plugins",
    descriptionPl: "Instalacja i aktywacja wszystkich wtyczek wymaganych przez szablon.",
    descriptionEn: "Installation and activation of all plugins required by the theme.",
    price: 18400,
    originalPrice: 33400,
    required: false, badgePl: null, badgeEn: null, sortOrder: 1,
  },
  {
    namePl: "Pakiet Instalacji i Dostosowania",
    nameEn: "Installation & Customization Package",
    descriptionPl: "Instalacja szablonu + wtyczki + podstawowe dopasowanie kolorów, logo i treści do Twojej firmy.",
    descriptionEn: "Theme + plugins + basic color, logo and content customization for your brand.",
    price: 93500,
    originalPrice: 119800,
    required: false, badgePl: null, badgeEn: null, sortOrder: 2,
  },
  {
    namePl: "Zgodność z GDPR i CCPA",
    nameEn: "GDPR & CCPA Compliance",
    descriptionPl: "Konfiguracja polityki prywatności, cookies i formularzy zgodnych z RODO i CCPA.",
    descriptionEn: "Privacy policy, cookie and form configuration compliant with GDPR and CCPA.",
    price: 22200,
    originalPrice: 33400,
    required: false, badgePl: null, badgeEn: null, sortOrder: 3,
  },
  {
    namePl: "Wszystko w Jednym: Personalizacja",
    nameEn: "All-in-One: Personalization",
    descriptionPl: "Kompletna usługa: instalacja, wtyczki, pełna personalizacja, GDPR + 6 miesięcy wsparcia technicznego.",
    descriptionEn: "Complete service: installation, plugins, full customization, GDPR + 6 months technical support.",
    price: 375200,
    originalPrice: 622300,
    required: false,
    badgePl: "Usługa Dnia", badgeEn: "Service of the Day", sortOrder: 4,
  },
];

// ─── Wtyczki WordPress ─────────────────────────────────────────────────────────
const WP_PLUGIN_ADDONS = [
  {
    namePl: "Instalacja wtyczki",
    nameEn: "Plugin installation",
    descriptionPl: "Instalacja i aktywacja wtyczki na Twoim WordPressie przez nasz zespół.",
    descriptionEn: "Plugin installation and activation on your WordPress by our team.",
    price: 9900,
    originalPrice: 14900,
    required: false, badgePl: null, badgeEn: null, sortOrder: 0,
  },
  {
    namePl: "Konfiguracja i integracja",
    nameEn: "Configuration & Integration",
    descriptionPl: "Pełna konfiguracja wtyczki i integracja z istniejącym motywem i innymi wtyczkami.",
    descriptionEn: "Full plugin configuration and integration with your existing theme and plugins.",
    price: 18400,
    originalPrice: 24900,
    required: false, badgePl: null, badgeEn: null, sortOrder: 1,
  },
  {
    namePl: "Dostosowanie wyglądu wtyczki",
    nameEn: "Plugin appearance customization",
    descriptionPl: "Dopasowanie stylów CSS wtyczki do wyglądu Twojej strony.",
    descriptionEn: "CSS styling of the plugin to match your website design.",
    price: 24900,
    originalPrice: 34900,
    required: false, badgePl: null, badgeEn: null, sortOrder: 2,
  },
  {
    namePl: "Wsparcie techniczne (30 dni)",
    nameEn: "Technical support (30 days)",
    descriptionPl: "30 dni wsparcia e-mail w razie problemów z wtyczką lub konfliktu z motywem.",
    descriptionEn: "30 days of email support for plugin issues or theme conflicts.",
    price: 14900,
    originalPrice: 19900,
    required: false, badgePl: null, badgeEn: null, sortOrder: 3,
  },
  {
    namePl: "Pakiet Kompletny — Installation + Config + Support",
    nameEn: "Complete Package — Install + Config + Support",
    descriptionPl: "Instalacja, pełna konfiguracja, dopasowanie wyglądu + 30 dni wsparcia.",
    descriptionEn: "Installation, full configuration, appearance customization + 30 days support.",
    price: 49900,
    originalPrice: 89600,
    required: false,
    badgePl: "Najlepsza wartość", badgeEn: "Best value", sortOrder: 4,
  },
];

// ─── Szablony (nie-WordPress) i inne ──────────────────────────────────────────
const GENERIC_ADDONS = [
  {
    namePl: "Wdrożenie na serwer",
    nameEn: "Server deployment",
    descriptionPl: "Konfiguracja i wdrożenie projektu na Twoim serwerze lub platformie hostingowej.",
    descriptionEn: "Configuration and deployment of the project on your server or hosting platform.",
    price: 29900,
    originalPrice: 39900,
    required: false, badgePl: null, badgeEn: null, sortOrder: 0,
  },
  {
    namePl: "Dostosowanie projektu",
    nameEn: "Project customization",
    descriptionPl: "Zmiana kolorystyki, logo, treści i podstawowych ustawień pod Twój branding.",
    descriptionEn: "Color scheme, logo, content and basic settings customization for your brand.",
    price: 49900,
    originalPrice: 69900,
    required: false, badgePl: null, badgeEn: null, sortOrder: 1,
  },
  {
    namePl: "Integracja z zewnętrznymi API",
    nameEn: "External API integration",
    descriptionPl: "Podłączenie projektu do zewnętrznych usług: płatności, CRM, e-mail mktg itp.",
    descriptionEn: "Connecting the project to external services: payments, CRM, email marketing, etc.",
    price: 74900,
    originalPrice: 99900,
    required: false, badgePl: null, badgeEn: null, sortOrder: 2,
  },
  {
    namePl: "Wsparcie techniczne (30 dni)",
    nameEn: "Technical support (30 days)",
    descriptionPl: "30 dni wsparcia e-mail od momentu wdrożenia projektu.",
    descriptionEn: "30 days of email support from the moment of project deployment.",
    price: 19900,
    originalPrice: 29900,
    required: false, badgePl: null, badgeEn: null, sortOrder: 3,
  },
];

function getAddons(categoryPl: string) {
  if (categoryPl === "Motyw WordPress" || categoryPl === "Motyw WooCommerce") {
    return WP_THEME_ADDONS;
  }
  if (categoryPl === "Wtyczki") {
    return WP_PLUGIN_ADDONS;
  }
  return GENERIC_ADDONS;
}

async function main() {
  console.log("Fetching all products...");
  const products = await prisma.product.findMany({
    select: { id: true, namePl: true, categoryPl: true },
  });
  console.log(`Found ${products.length} product(s).\n`);

  for (const product of products) {
    const addons = getAddons(product.categoryPl);

    // Delete existing addons
    await prisma.addon.deleteMany({ where: { productId: product.id } });

    // Create new ones
    await prisma.addon.createMany({
      data: addons.map((a) => ({ ...a, productId: product.id, active: true })),
    });

    console.log(`✓ [${product.categoryPl}] "${product.namePl}" — ${addons.length} addonów`);
  }

  console.log("\nDone!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

