import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, ShoppingCart } from "lucide-react";
import UserActions from "@/components/admin/UserActions";

type Params = Promise<{ id: string }>;

export default async function AdminUserDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          product: true,
          variant: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) return notFound();

  const paidOrders = user.orders.filter((o: { status: string }) => o.status === "PAID");
  const totalSpent = paidOrders.reduce((sum: number, o: { amount: number }) => sum + o.amount, 0);

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Wróć do listy
      </Link>

      {/* User profile card */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xl font-bold">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{user.name || "Brak nazwy"}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}>
                {user.isActive ? "Aktywny" : "Nieaktywny"}
              </span>
            </div>
            <p className="text-gray-400 text-sm flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/[0.03] rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">Data rejestracji</p>
            <p className="text-white font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-500" />
              {new Date(user.createdAt).toLocaleDateString("pl-PL")}
            </p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">Zamówienia (opłacone)</p>
            <p className="text-white font-medium flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              {paidOrders.length}
            </p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">Łącznie wydano</p>
            <p className="text-primary font-bold text-lg">
              {formatPrice(totalSpent)}
            </p>
          </div>
        </div>
      </div>

      {/* Admin actions */}
      <UserActions
        userId={user.id}
        userName={user.name}
        userEmail={user.email}
        isActive={user.isActive}
      />

      {/* Orders */}
      <h2 className="text-lg font-bold text-white mb-4">Historia zamówień</h2>
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        {user.orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Produkt</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Wariant</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Kwota</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Status</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Data</th>
                </tr>
              </thead>
              <tbody>
                {user.orders.map((order: { id: string; product: { namePl: string }; variant: { namePl: string }; amount: number; status: string; createdAt: Date }) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="py-4 px-6 text-white text-sm font-medium">
                      {order.product.namePl}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {order.variant.namePl}
                    </td>
                    <td className="py-4 px-6 text-primary font-medium text-sm">
                      {formatPrice(order.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "PAID"
                            ? "bg-green-500/10 text-green-400"
                            : order.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString("pl-PL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">Brak zamówień.</p>
        )}
      </div>
    </div>
  );
}
