import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";
import ProductForm from "@/components/admin/ProductForm";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!product) return notFound();

  const formData = {
    id: product.id,
    slug: product.slug,
    namePl: product.namePl,
    nameEn: product.nameEn,
    descriptionPl: product.descriptionPl,
    descriptionEn: product.descriptionEn,
    categoryPl: product.categoryPl,
    categoryEn: product.categoryEn,
    technologies: parseJsonArray(product.technologies).join(", "),
    screenshots: parseJsonArray(product.screenshots),
    videoUrl: product.videoUrl || "",
    previewUrl: product.previewUrl || "",
    fileUrl: product.fileUrl,
    variants: product.variants.map((v) => ({
      id: v.id,
      namePl: v.namePl,
      nameEn: v.nameEn,
      descriptionPl: v.descriptionPl,
      descriptionEn: v.descriptionEn,
      price: v.price / 100,
    })),
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Edytuj produkt</h1>
      <ProductForm initialData={formData} />
    </div>
  );
}
