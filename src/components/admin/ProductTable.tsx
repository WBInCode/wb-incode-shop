"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Variant {
  id: string;
  namePl: string;
  price: number;
}

interface Product {
  id: string;
  slug: string;
  namePl: string;
  categoryPl: string;
  active: boolean;
  featured: boolean;
  screenshots: string[];
  variants: Variant[];
  _count: { orders: number };
  createdAt: Date;
}

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten produkt?")) return;

    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !featured }),
    });
    router.refresh();
  };

  if (products.length === 0) {
    return (
      <div className="bg-surface border border-white/5 rounded-2xl p-10 text-center">
        <p className="text-gray-500">Brak produktów. Dodaj pierwszy produkt.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                Nazwa
              </th>
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                Kategoria
              </th>
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                Cena od
              </th>
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                Zamówienia
              </th>
              <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                Status
              </th>
              <th className="text-right text-gray-400 text-sm font-medium py-4 px-6">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const minPrice =
                product.variants.length > 0
                  ? Math.min(...product.variants.map((v) => v.price))
                  : 0;

              return (
                <tr
                  key={product.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-white font-medium">{product.namePl}</p>
                      <p className="text-gray-500 text-xs">{product.slug}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-sm">
                    {product.categoryPl}
                  </td>
                  <td className="py-4 px-6 text-primary font-medium text-sm">
                    {formatPrice(minPrice)}
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-sm">
                    {product._count.orders}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.active
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-gray-400/10 text-gray-400"
                        }`}
                      >
                        {product.active ? "Aktywny" : "Nieaktywny"}
                      </span>
                      {product.featured && (
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleFeatured(product.id, product.featured)}
                        className="p-2 text-gray-400 hover:text-yellow-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title={product.featured ? "Usuń z wyróżnionych" : "Wyróżnij"}
                      >
                        <Star
                          className={`w-4 h-4 ${product.featured ? "fill-yellow-400 text-yellow-400" : ""}`}
                        />
                      </button>
                      <button
                        onClick={() => handleToggleActive(product.id, product.active)}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title={product.active ? "Dezaktywuj" : "Aktywuj"}
                      >
                        {product.active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
