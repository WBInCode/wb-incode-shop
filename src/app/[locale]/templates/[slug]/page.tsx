import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { parseProductArrays } from "@/lib/utils";
import Scene3DProducts from "@/components/ui/Scene3DProducts";
import TemplateDetailClient from "./TemplateDetailClient";

type Params = Promise<{ slug: string }>;

export default async function TemplateDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("templateDetail");

  const rawProduct = await prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      variants: { where: { active: true } },
      addons: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!rawProduct) return notFound();

  const product = parseProductArrays(rawProduct);

  return (
    <section className="relative pt-28 pb-24">
      <Scene3DProducts />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <TemplateDetailClient product={product} />
      </div>
    </section>
  );
}
