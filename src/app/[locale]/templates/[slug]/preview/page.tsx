import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import TemplatePreview from "@/components/shop/TemplatePreview";

type Params = Promise<{ slug: string }>;

export default async function PreviewPage({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("preview");

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: {
      namePl: true,
      nameEn: true,
      slug: true,
      previewUrl: true,
    },
  });

  if (!product) return notFound();
  if (!product.previewUrl) redirect(`/${locale}/templates/${slug}`);

  const name = locale === "pl" ? product.namePl : product.nameEn;

  // Use proxy route to serve HTML with correct headers (Blob serves with Content-Disposition: attachment)
  const proxyUrl = `/api/preview/${product.slug}`;

  return (
    <TemplatePreview
      previewUrl={proxyUrl}
      productName={name}
      productSlug={product.slug}
    />
  );
}
