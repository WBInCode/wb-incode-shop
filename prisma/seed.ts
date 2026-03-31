import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcryptjs.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { email: "admin@wb-incode.pl" },
    update: {},
    create: {
      email: "admin@wb-incode.pl",
      passwordHash,
      name: "Admin",
      role: "SUPER_ADMIN",
    },
  });
  console.log("Admin user created: admin@wb-incode.pl / admin123");

  // Create one test product per category
  const product1 = await prisma.product.upsert({
    where: { slug: "modern-landing-page" },
    update: {},
    create: {
      slug: "modern-landing-page",
      namePl: "Nowoczesny Landing Page",
      nameEn: "Modern Landing Page",
      descriptionPl:
        "Profesjonalny szablon landing page z efektami glassmorphism, płynnymi animacjami Framer Motion i w pełni responsywnym designem. Idealny dla startupów, produktów SaaS i agencji kreatywnych.\n\nZawiera sekcje: Hero z animowanym tłem, usługi, portfolio, FAQ, formularz kontaktowy i wiele więcej.",
      descriptionEn:
        "Professional landing page template with glassmorphism effects, smooth Framer Motion animations, and fully responsive design. Perfect for startups, SaaS products, and creative agencies.\n\nIncludes sections: Hero with animated background, services, portfolio, FAQ, contact form and more.",
      categoryPl: "Szablon Strony",
      categoryEn: "Website Template",
      technologies: JSON.stringify(["Next.js", "Tailwind CSS", "Framer Motion", "TypeScript"]),
      screenshots: JSON.stringify([
        "https://placehold.co/800x500/0a0a0a/30e87a?text=Landing+Page+Hero",
        "https://placehold.co/800x500/121212/30e87a?text=Services+Section",
        "https://placehold.co/800x500/0a0a0a/30e87a?text=Portfolio+Grid",
      ]),
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      fileUrl: "products/modern-landing-page.zip",
      featured: true,
      active: true,
      variants: {
        create: [
          {
            namePl: "Licencja Personal",
            nameEn: "Personal License",
            descriptionPl: "Użytek w jednym projekcie osobistym, bez prawa odsprzedaży.",
            descriptionEn: "Use in one personal project, no resale rights.",
            price: 9900,
          },
          {
            namePl: "Licencja Commercial",
            nameEn: "Commercial License",
            descriptionPl: "Użytek komercyjny bez limitu projektów, z prawem modyfikacji.",
            descriptionEn: "Commercial use, unlimited projects, with modification rights.",
            price: 24900,
          },
        ],
      },
    },
  });
  console.log("Product created:", product1.namePl);

  const product2 = await prisma.product.upsert({
    where: { slug: "developer-portfolio-wp" },
    update: {},
    create: {
      slug: "developer-portfolio-wp",
      namePl: "Developer Portfolio WordPress",
      nameEn: "Developer Portfolio WordPress",
      descriptionPl:
        "Profesjonalny motyw WordPress dla developerów i freelancerów. Responsywny design, portfolio z filtrami, blog, formularz kontaktowy i integracja z WooCommerce.\n\nŁatwa personalizacja przez Customizer i Block Editor.",
      descriptionEn:
        "Professional WordPress theme for developers and freelancers. Responsive design, filterable portfolio, blog, contact form and WooCommerce integration.\n\nEasy customization via Customizer and Block Editor.",
      categoryPl: "Szablony Strony WordPress",
      categoryEn: "WordPress Templates",
      technologies: JSON.stringify(["WordPress", "PHP", "JavaScript", "CSS", "Block Editor"]),
      screenshots: JSON.stringify([
        "https://placehold.co/800x500/0a0a0a/30e87a?text=WP+Portfolio+Home",
        "https://placehold.co/800x500/121212/30e87a?text=WP+Portfolio+Projects",
        "https://placehold.co/800x500/0a0a0a/30e87a?text=WP+Portfolio+Blog",
      ]),
      fileUrl: "products/developer-portfolio-wp.zip",
      featured: true,
      active: true,
      variants: {
        create: [
          {
            namePl: "Licencja Personal",
            nameEn: "Personal License",
            descriptionPl: "Jeden projekt, użytek osobisty.",
            descriptionEn: "One project, personal use.",
            price: 7900,
          },
          {
            namePl: "Licencja Commercial",
            nameEn: "Commercial License",
            descriptionPl: "Bez limitu projektów, użytek komercyjny.",
            descriptionEn: "Unlimited projects, commercial use.",
            price: 19900,
          },
        ],
      },
    },
  });
  console.log("Product created:", product2.namePl);

  const product3 = await prisma.product.upsert({
    where: { slug: "wp-seo-optimizer" },
    update: {},
    create: {
      slug: "wp-seo-optimizer",
      namePl: "WP SEO Optimizer",
      nameEn: "WP SEO Optimizer",
      descriptionPl:
        "Zaawansowana wtyczka WordPress do optymalizacji SEO. Automatyczne meta tagi, sitemap XML, schema markup, analiza treści i monitoring pozycji w Google.\n\nKompatybilna z Gutenberg i popularnymi page builderami.",
      descriptionEn:
        "Advanced WordPress plugin for SEO optimization. Automatic meta tags, XML sitemap, schema markup, content analysis and Google position monitoring.\n\nCompatible with Gutenberg and popular page builders.",
      categoryPl: "Wtyczki",
      categoryEn: "Plugins",
      technologies: JSON.stringify(["WordPress", "PHP", "REST API", "JavaScript"]),
      screenshots: JSON.stringify([
        "https://placehold.co/800x500/0a0a0a/30e87a?text=SEO+Dashboard",
        "https://placehold.co/800x500/121212/30e87a?text=Content+Analysis",
      ]),
      fileUrl: "products/wp-seo-optimizer.zip",
      featured: false,
      active: true,
      variants: {
        create: [
          {
            namePl: "Licencja Standard",
            nameEn: "Standard License",
            descriptionPl: "1 strona, aktualizacje przez 12 miesięcy.",
            descriptionEn: "1 site, 12 months of updates.",
            price: 4900,
          },
          {
            namePl: "Licencja Agency",
            nameEn: "Agency License",
            descriptionPl: "Bez limitu stron, priorytetowe wsparcie.",
            descriptionEn: "Unlimited sites, priority support.",
            price: 14900,
          },
        ],
      },
    },
  });
  console.log("Product created:", product3.namePl);

  const product4 = await prisma.product.upsert({
    where: { slug: "seo-audit-script" },
    update: {},
    create: {
      slug: "seo-audit-script",
      namePl: "SEO Audit Script",
      nameEn: "SEO Audit Script",
      descriptionPl:
        "Automatyczny skrypt do audytu SEO stron internetowych. Analizuje meta tagi, strukturę nagłówków, prędkość ładowania, broken linki i wiele więcej.\n\nGeneruje raport PDF z rekomendacjami optymalizacji.",
      descriptionEn:
        "Automated SEO audit script for websites. Analyzes meta tags, heading structure, loading speed, broken links, and more.\n\nGenerates a PDF report with optimization recommendations.",
      categoryPl: "Skrypty",
      categoryEn: "Scripts",
      technologies: JSON.stringify(["Node.js", "Puppeteer", "TypeScript"]),
      screenshots: JSON.stringify([
        "https://placehold.co/800x500/0a0a0a/30e87a?text=SEO+Report",
        "https://placehold.co/800x500/121212/30e87a?text=CLI+Output",
      ]),
      fileUrl: "products/seo-audit-script.zip",
      featured: false,
      active: true,
      variants: {
        create: [
          {
            namePl: "Licencja Standard",
            nameEn: "Standard License",
            descriptionPl: "Pełna wersja z aktualizacjami przez 12 miesięcy.",
            descriptionEn: "Full version with 12 months of updates.",
            price: 4900,
          },
        ],
      },
    },
  });
  console.log("Product created:", product4.namePl);

  const product5 = await prisma.product.upsert({
    where: { slug: "react-admin-dashboard" },
    update: {},
    create: {
      slug: "react-admin-dashboard",
      namePl: "React Admin Dashboard",
      nameEn: "React Admin Dashboard",
      descriptionPl:
        "Gotowy panel administracyjny z wykresami, tabelami, formularzami i zarządzaniem użytkownikami. Ciemny motyw, responsywny layout i integracja z REST API.\n\nIdealny jako punkt startowy dla aplikacji backoffice.",
      descriptionEn:
        "Ready-to-use admin dashboard with charts, tables, forms, and user management. Dark theme, responsive layout, and REST API integration.\n\nPerfect starting point for backoffice applications.",
      categoryPl: "Narzędzia",
      categoryEn: "Tools",
      technologies: JSON.stringify(["React", "TypeScript", "Recharts", "Tailwind CSS", "React Query"]),
      screenshots: JSON.stringify([
        "https://placehold.co/800x500/0a0a0a/30e87a?text=Dashboard+Overview",
        "https://placehold.co/800x500/121212/30e87a?text=Analytics+Charts",
        "https://placehold.co/800x500/0a0a0a/30e87a?text=User+Management",
      ]),
      fileUrl: "products/react-admin-dashboard.zip",
      featured: true,
      active: true,
      variants: {
        create: [
          {
            namePl: "Licencja Personal",
            nameEn: "Personal License",
            descriptionPl: "Jeden projekt, użytek osobisty.",
            descriptionEn: "One project, personal use.",
            price: 12900,
          },
          {
            namePl: "Licencja Commercial",
            nameEn: "Commercial License",
            descriptionPl: "Bez limitu, użytek komercyjny.",
            descriptionEn: "Unlimited, commercial use.",
            price: 29900,
          },
        ],
      },
    },
  });
  console.log("Product created:", product5.namePl);

  const product6 = await prisma.product.upsert({
    where: { slug: "wp-speed-lite" },
    update: {},
    create: {
      slug: "wp-speed-lite",
      namePl: "WP Speed Lite – Wtyczka Przyspieszająca WordPress",
      nameEn: "WP Speed Lite – WordPress Speed Optimization Plugin",
      descriptionPl:
        "Prosta, ale potężna wtyczka przyspieszająca Twojego WordPressa. WP Speed Lite oferuje pełny zestaw narzędzi do optymalizacji szybkości strony:\n\n• Cache HTML stron – buforowanie dla gości z konfigurowalnym TTL, osobny cache dla mobile, wykluczenia URL, podgląd i czyszczenie jednym kliknięciem\n• Nagłówki cache przeglądarki – trzy profile: Bezpieczny, Domyślny, Agresywny + automatyczne reguły .htaccess dla Apache\n• Minifikacja HTML, CSS i JS – zmniejsz rozmiar plików i przyspiesz ładowanie strony\n• Łączenie CSS/JS – opcjonalne łączenie plików z możliwością wykluczeń (z zabezpieczeniem w Trybie bezpiecznym)\n• Lazy load obrazków i iframe – opóźnione ładowanie mediów z wykluczeniami i pomijaniem pierwszego obrazka\n• Krytyczny CSS – ręczne wklejanie critical CSS dla natychmiastowego renderowania\n• Preload / Preconnect / DNS-Prefetch – podpowiedzi dla przeglądarki przyspieszające pobieranie zasobów\n• Integracja z CDN – przepinanie URL zasobów na własną domenę CDN\n• Czyszczenie bazy danych – usuwanie rewizji, auto-drafty, kosza i transientów\n• Logi i diagnostyka – pełny dziennik zdarzeń i endpoint diagnostyczny\n\nTrzy presety konfiguracji: Bezpieczny, Rekomendowany i Agresywny – wybierz jednym kliknięciem. Wymaga WordPress 6.0+ i PHP 7.4+.",
      descriptionEn:
        "A simple yet powerful plugin to speed up your WordPress site. WP Speed Lite provides a complete toolkit for website performance optimization:\n\n• HTML Page Cache – full-page caching for guests with configurable TTL, separate mobile cache, URL exclusions, preview and one-click purge\n• Browser Cache Headers – three profiles: Safe, Default, Aggressive + automatic .htaccess rules for Apache\n• HTML, CSS & JS Minification – reduce file sizes and speed up page loading\n• CSS/JS Combining – optional file combining with exclusions (restricted in Safe Mode)\n• Lazy Load for Images & Iframes – deferred media loading with exclusions and first-image skip\n• Critical CSS – manually paste critical CSS for instant above-the-fold rendering\n• Preload / Preconnect / DNS-Prefetch – browser resource hints for faster asset fetching\n• CDN Integration – rewrite asset URLs to your CDN domain\n• Database Cleanup – remove revisions, auto-drafts, trash, and transients\n• Logs & Diagnostics – full event log and diagnostic endpoint\n\nThree configuration presets: Safe, Recommended, and Aggressive – set up with one click. Requires WordPress 6.0+ and PHP 7.4+.",
      categoryPl: "Wtyczki",
      categoryEn: "Plugins",
      technologies: JSON.stringify(["WordPress", "PHP", "Apache", ".htaccess", "CDN", "HTML Cache"]),
      screenshots: JSON.stringify([
        "https://placehold.co/800x500/0a0a0a/30e87a?text=WP+Speed+Lite+Dashboard",
        "https://placehold.co/800x500/121212/30e87a?text=Cache+Settings",
        "https://placehold.co/800x500/0a0a0a/30e87a?text=CSS+JS+Minification",
      ]),
      fileUrl: "products/wp-speed-lite.zip",
      featured: true,
      active: true,
      variants: {
        create: [
          {
            namePl: "Licencja Standard",
            nameEn: "Standard License",
            descriptionPl: "1 strona WordPress, aktualizacje przez 12 miesięcy.",
            descriptionEn: "1 WordPress site, 12 months of updates.",
            price: 4900,
          },
          {
            namePl: "Licencja Agency",
            nameEn: "Agency License",
            descriptionPl: "Bez limitu stron, priorytetowe wsparcie, aktualizacje przez 12 miesięcy.",
            descriptionEn: "Unlimited sites, priority support, 12 months of updates.",
            price: 14900,
          },
        ],
      },
    },
  });
  console.log("Product created:", product6.namePl);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
