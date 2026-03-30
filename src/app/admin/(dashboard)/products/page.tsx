import prisma from "@/lib/prisma";
import { parseProductArrays } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProductTable from "@/components/admin/ProductTable";

export default async function AdminProductsPage() {
  const rawProducts = await prisma.product.findMany({
    include: { variants: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  const products = rawProducts.map(parseProductArrays);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Produkty</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:shadow-[0_0_30px_rgba(48,232,122,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nowy produkt
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  );
}
