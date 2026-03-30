import { getTranslations } from "next-intl/server";
import TemplateGrid from "@/components/shop/TemplateGrid";
import prisma from "@/lib/prisma";
import { parseProductArrays } from "@/lib/utils";

export default async function TemplatesPage() {
  const t = await getTranslations("templates");

  const rawProducts = await prisma.product.findMany({
    where: { active: true },
    include: { variants: { where: { active: true }, select: { price: true } } },
    orderBy: { createdAt: "desc" },
  });

  const products = rawProducts.map(parseProductArrays);

  return (
    <section className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
        <TemplateGrid products={products} />
      </div>
    </section>
  );
}
