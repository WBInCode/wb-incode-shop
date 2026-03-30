import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { parseProductArrays } from "@/lib/utils";
import TemplateDetailClient from "./TemplateDetailClient";

type Params = Promise<{ slug: string }>;

export default async function TemplateDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("templateDetail");

  const rawProduct = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { variants: { where: { active: true } } },
  });

  if (!rawProduct) return notFound();

  const product = parseProductArrays(rawProduct);

  return (
    <section className="pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <TemplateDetailClient product={product} />
      </div>
    </section>
  );
}
