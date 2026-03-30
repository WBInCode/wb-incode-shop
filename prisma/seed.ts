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

  // Create diverse products
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
      categoryPl: "Szablon strony",
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
    where: { slug: "e-commerce-starter" },
    update: {},
    create: {
      slug: "e-commerce-starter",
      namePl: "E-Commerce Starter Kit",
      nameEn: "E-Commerce Starter Kit",
      descriptionPl:
        "Kompletny szablon sklepu internetowego z gotowym katalogiem produktów, koszykiem, formularzem checkout i panelem administracyjnym. Zbudowany na Next.js z pełnym SSR.\n\nWszystko czego potrzebujesz, aby uruchomić swój sklep online.",
      descriptionEn:
        "Complete e-commerce template with product catalog, shopping cart, checkout form, and admin panel. Built on Next.js with full SSR.\n\nEverything you need to launch your online store.",
      categoryPl: "Szablon strony",
      categoryEn: "Website Template",
      technologies: JSON.stringify(["Next.js", "Tailwind CSS", "Prisma", "PostgreSQL", "Stripe"]),
      screenshots: JSON.stringify([
        "https://placehold.co/800x500/0a0a0a/30e87a?text=E-Commerce+Home",
        "https://placehold.co/800x500/121212/30e87a?text=Product+Page",
        "https://placehold.co/800x500/0a0a0a/30e87a?text=Shopping+Cart",
        "https://placehold.co/800x500/121212/30e87a?text=Admin+Panel",
      ]),
      fileUrl: "products/e-commerce-starter.zip",
      featured: true,
      active: true,
      variants: {
        create: [
          {
            namePl: "Licencja Personal",
            nameEn: "Personal License",
            descriptionPl: "Jeden projekt, użytek osobisty.",
            descriptionEn: "One project, personal use.",
            price: 14900,
          },
          {
            namePl: "Licencja Commercial",
            nameEn: "Commercial License",
            descriptionPl: "Bez limitu projektów, użytek komercyjny.",
            descriptionEn: "Unlimited projects, commercial use.",
            price: 34900,
          },
        ],
      },
    },
  });
  console.log("Product created:", product2.namePl);

  const product3 = await prisma.product.upsert({
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
      categoryPl: "Narzędzie",
      categoryEn: "Tool",
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
      categoryPl: "Skrypt",
      categoryEn: "Script",
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
    where: { slug: "nextjs-auth-boilerplate" },
    update: {},
    create: {
      slug: "nextjs-auth-boilerplate",
      namePl: "Next.js Auth Boilerplate",
      nameEn: "Next.js Auth Boilerplate",
      descriptionPl:
        "Gotowy system logowania i rejestracji z NextAuth v5. Obsługuje Google, GitHub, email/hasło + email verification. Panele użytkownika i admina.\n\nZaoszczędź dziesiątki godzin konfiguracji autentykacji.",
      descriptionEn:
        "Ready-made authentication system with NextAuth v5. Supports Google, GitHub, email/password + email verification. User and admin panels.\n\nSave dozens of hours on authentication setup.",
      categoryPl: "Boilerplate",
      categoryEn: "Boilerplate",
      technologies: JSON.stringify(["Next.js", "NextAuth", "Prisma", "PostgreSQL", "TypeScript"]),
      screenshots: JSON.stringify([
        "https://placehold.co/800x500/0a0a0a/30e87a?text=Login+Page",
        "https://placehold.co/800x500/121212/30e87a?text=User+Dashboard",
        "https://placehold.co/800x500/0a0a0a/30e87a?text=Admin+Panel",
      ]),
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      fileUrl: "products/nextjs-auth-boilerplate.zip",
      featured: false,
      active: true,
      variants: {
        create: [
          {
            namePl: "Licencja Personal",
            nameEn: "Personal License",
            descriptionPl: "Jeden projekt osobisty.",
            descriptionEn: "One personal project.",
            price: 7900,
          },
          {
            namePl: "Licencja Commercial",
            nameEn: "Commercial License",
            descriptionPl: "Bez limitu, użytek komercyjny + wsparcie email.",
            descriptionEn: "Unlimited, commercial use + email support.",
            price: 19900,
          },
        ],
      },
    },
  });
  console.log("Product created:", product5.namePl);

  const product6 = await prisma.product.upsert({
    where: { slug: "wordpress-developer-toolkit" },
    update: {},
    create: {
      slug: "wordpress-developer-toolkit",
      namePl: "WordPress Developer Toolkit",
      nameEn: "WordPress Developer Toolkit",
      descriptionPl:
        "Zestaw narzędzi dla programistów WordPress: starter theme z Block Editor, wtyczka Custom Fields, skrypty do deploymentu i migracji bazy danych.\n\nWszystko czego potrzebujesz do profesjonalnego developmentu WP.",
      descriptionEn:
        "Toolkit for WordPress developers: starter theme with Block Editor, Custom Fields plugin, deployment scripts, and database migration tools.\n\nEverything you need for professional WP development.",
      categoryPl: "Wtyczka",
      categoryEn: "Plugin",
      technologies: JSON.stringify(["WordPress", "PHP", "JavaScript", "Docker"]),
      screenshots: JSON.stringify([
        "https://placehold.co/800x500/0a0a0a/30e87a?text=Theme+Preview",
        "https://placehold.co/800x500/121212/30e87a?text=Block+Editor",
      ]),
      fileUrl: "products/wordpress-developer-toolkit.zip",
      featured: false,
      active: true,
      variants: {
        create: [
          {
            namePl: "Licencja Developer",
            nameEn: "Developer License",
            descriptionPl: "Pełna wersja, aktualizacje przez 12 miesięcy.",
            descriptionEn: "Full version, 12 months of updates.",
            price: 9900,
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
