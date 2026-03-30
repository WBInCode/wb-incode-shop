import prisma from "@/lib/prisma";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [totalProducts, totalOrders, paidOrders] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { amount: true },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const revenueFormatted = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(totalRevenue / 100);

  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { product: true, variant: true },
  });

  const stats = [
    {
      label: "Produkty",
      value: totalProducts,
      icon: Package,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Zamówienia",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Opłacone",
      value: paidOrders.length,
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Przychód",
      value: revenueFormatted,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-white/5 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          Ostatnie zamówienia
        </h2>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">
                    Email
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">
                    Produkt
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">
                    Kwota
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-3 px-4 text-white text-sm">
                      {order.email}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {order.product.namePl}
                    </td>
                    <td className="py-3 px-4 text-white text-sm font-medium">
                      {new Intl.NumberFormat("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                      }).format(order.amount / 100)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === "PAID"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : order.status === "PENDING"
                            ? "bg-yellow-400/10 text-yellow-400"
                            : order.status === "CANCELLED"
                            ? "bg-red-400/10 text-red-400"
                            : "bg-gray-400/10 text-gray-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString("pl-PL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">
            Brak zamówień do wyświetlenia.
          </p>
        )}
      </div>
    </div>
  );
}
