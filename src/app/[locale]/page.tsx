import Hero from "@/components/shop/Hero";
import FeaturedTemplates from "@/components/shop/FeaturedTemplates";
import HowItWorks from "@/components/shop/HowItWorks";
import FAQ from "@/components/shop/FAQ";
import prisma from "@/lib/prisma";
import { parseProductArrays } from "@/lib/utils";

export default async function HomePage() {
  const rawProducts = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { variants: { where: { active: true }, select: { price: true } } },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  const featuredProducts = rawProducts.map(parseProductArrays);

  return (
    <>
      <Hero />
      <FeaturedTemplates products={featuredProducts} />
      <HowItWorks />
      <FAQ />
    </>
  );
}
