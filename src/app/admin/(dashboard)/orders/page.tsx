import prisma from "@/lib/prisma";
import OrderTable from "@/components/admin/OrderTable";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { product: true, variant: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Zamówienia</h1>
      <OrderTable orders={orders} />
    </div>
  );
}
