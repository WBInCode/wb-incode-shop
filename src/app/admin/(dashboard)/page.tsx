import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Users,
  Download,
  Eye,
} from "lucide-react";

function formatPLN(grosze: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(grosze / 100);
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    totalProducts,
    totalOrders,
    paidOrders,
    ordersLast7,
    ordersPrev7,
    paidLast7,
    paidPrev7,
    recentOrders,
    topProducts,
    ordersLast30,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { amount: true },
    }),
    prisma.order.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    }),
    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: sevenDaysAgo } },
      select: { amount: true },
    }),
    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      select: { amount: true },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { product: true, variant: true },
    }),
    prisma.product.findMany({
      where: { active: true },
      include: {
        _count: { select: { orders: true } },
        orders: {
          where: { status: "PAID" },
          select: { amount: true },
        },
      },
      orderBy: { orders: { _count: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true, amount: true },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const revenueLast7 = paidLast7.reduce((sum, o) => sum + o.amount, 0);
  const revenuePrev7 = paidPrev7.reduce((sum, o) => sum + o.amount, 0);

  const avgOrderValue = paidOrders.length > 0
    ? Math.round(totalRevenue / paidOrders.length)
    : 0;

  const conversionRate = totalOrders > 0
    ? ((paidOrders.length / totalOrders) * 100).toFixed(1)
    : "0";

  // Calculate percent changes
  const orderChange = ordersPrev7 > 0
    ? (((ordersLast7 - ordersPrev7) / ordersPrev7) * 100).toFixed(0)
    : ordersLast7 > 0 ? "+100" : "0";
  const revenueChange = revenuePrev7 > 0
    ? (((revenueLast7 - revenuePrev7) / revenuePrev7) * 100).toFixed(0)
    : revenueLast7 > 0 ? "+100" : "0";

  // Daily orders for last 30 days chart
  const dailyData: Record<string, { orders: number; revenue: number; paid: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    dailyData[key] = { orders: 0, revenue: 0, paid: 0 };
  }
  for (const o of ordersLast30) {
    const key = new Date(o.createdAt).toISOString().split("T")[0];
    if (dailyData[key]) {
      dailyData[key].orders++;
      if (o.status === "PAID") {
        dailyData[key].revenue += o.amount;
        dailyData[key].paid++;
      }
    }
  }
  const chartDays = Object.entries(dailyData);
  const maxOrders = Math.max(...chartDays.map(([, d]) => d.orders), 1);

  const stats = [
    {
      label: "Przychód",
      value: formatPLN(totalRevenue),
      subtext: `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}% vs tyg. temu`,
      trend: Number(revenueChange) >= 0,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Zamówienia",
      value: totalOrders,
      subtext: `${Number(orderChange) >= 0 ? "+" : ""}${orderChange}% vs tyg. temu`,
      trend: Number(orderChange) >= 0,
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Konwersja",
      value: `${conversionRate}%`,
      subtext: `${paidOrders.length} opłaconych z ${totalOrders}`,
      trend: Number(conversionRate) > 50,
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Średnia wartość",
      value: formatPLN(avgOrderValue),
      subtext: `${totalProducts} aktywnych produktów`,
      trend: true,
      icon: BarChart3,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Przegląd sklepu</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:shadow-[0_0_20px_rgba(48,232,122,0.3)] transition-all"
          >
            <Package className="w-4 h-4" />
            Nowy produkt
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-white/5 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  stat.trend ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {stat.trend ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Activity chart + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Orders chart - last 30 days */}
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Aktywność (30 dni)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Zamówienia
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                Opłacone
              </span>
            </div>
          </div>
          {(() => {
            const chartH = 160;
            const chartW = 600;
            const padding = { top: 10, right: 10, bottom: 25, left: 35 };
            const w = chartW - padding.left - padding.right;
            const h = chartH - padding.top - padding.bottom;
            const days = chartDays;
            const stepX = w / Math.max(days.length - 1, 1);

            const ordersPoints = days.map(([, d], i) => ({
              x: padding.left + i * stepX,
              y: padding.top + h - (d.orders / maxOrders) * h,
            }));
            const paidPoints = days.map(([, d], i) => ({
              x: padding.left + i * stepX,
              y: padding.top + h - (d.paid / maxOrders) * h,
            }));

            const toLine = (pts: { x: number; y: number }[]) =>
              pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
            const toArea = (pts: { x: number; y: number }[]) =>
              toLine(pts) + ` L${pts[pts.length - 1].x},${padding.top + h} L${pts[0].x},${padding.top + h} Z`;

            // Y axis labels
            const yLabels = [0, Math.round(maxOrders / 2), maxOrders];

            return (
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-44" preserveAspectRatio="none">
                {/* Grid lines */}
                {yLabels.map((val) => {
                  const y = padding.top + h - (val / maxOrders) * h;
                  return (
                    <g key={val}>
                      <line x1={padding.left} y1={y} x2={chartW - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      <text x={padding.left - 6} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="7">{val}</text>
                    </g>
                  );
                })}

                {/* X axis labels */}
                {days.map(([date], i) => {
                  const day = new Date(date).getDate();
                  if (day !== 1 && day !== 5 && day !== 10 && day !== 15 && day !== 20 && day !== 25) return null;
                  return (
                    <text key={date} x={padding.left + i * stepX} y={chartH - 5} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">
                      {new Date(date).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                    </text>
                  );
                })}

                {/* Area fills */}
                <path d={toArea(ordersPoints)} fill="rgba(48,232,122,0.1)" />
                <path d={toArea(paidPoints)} fill="rgba(96,165,250,0.1)" />

                {/* Lines */}
                <path d={toLine(ordersPoints)} fill="none" stroke="rgba(48,232,122,0.8)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d={toLine(paidPoints)} fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth="1.5" strokeLinejoin="round" />

                {/* Data points */}
                {ordersPoints.map((p, i) => (
                  days[i][1].orders > 0 && <circle key={`o-${i}`} cx={p.x} cy={p.y} r="2" fill="#30e87a" />
                ))}
                {paidPoints.map((p, i) => (
                  days[i][1].paid > 0 && <circle key={`p-${i}`} cx={p.x} cy={p.y} r="2" fill="#60a5fa" />
                ))}
              </svg>
            );
          })()}
        </div>

        {/* Top products */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Bestsellery</h2>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, i) => {
                const productRevenue = product.orders.reduce((s, o) => s + o.amount, 0);
                return (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-primary/20 text-primary" :
                      i === 1 ? "bg-blue-400/20 text-blue-400" :
                      "bg-white/5 text-gray-500"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{product.namePl}</p>
                      <p className="text-xs text-gray-500">
                        {product._count.orders} zam. · {formatPLN(productRevenue)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-6">Brak danych</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Ostatnie zamówienia</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:text-primary/80 transition-colors">
            Zobacz wszystkie →
          </Link>
        </div>

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
