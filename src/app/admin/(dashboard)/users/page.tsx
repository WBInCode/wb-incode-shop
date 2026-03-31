import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Users, Search } from "lucide-react";
import Link from "next/link";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      orders: {
        where: { status: "PAID" },
        select: { amount: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const usersWithStats = users.map((user: typeof users[number]) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    ordersCount: user.orders.length,
    totalSpent: user.orders.reduce((sum: number, o: { amount: number }) => sum + o.amount, 0),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Użytkownicy</h1>
          <p className="text-gray-400 text-sm mt-1">
            {users.length} zarejestrowanych klientów
          </p>
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        {usersWithStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Imię</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Email</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Zakupy</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Wydano</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Data rejestracji</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {usersWithStats.map((user: typeof usersWithStats[number]) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="py-4 px-6 text-white text-sm font-medium">{user.name}</td>
                    <td className="py-4 px-6 text-gray-400 text-sm">{user.email}</td>
                    <td className="py-4 px-6 text-gray-400 text-sm">{user.ordersCount}</td>
                    <td className="py-4 px-6 text-primary font-medium text-sm">
                      {formatPrice(user.totalSpent)}
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-primary text-sm hover:underline"
                      >
                        Szczegóły
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">Brak zarejestrowanych użytkowników.</p>
        )}
      </div>
    </div>
  );
}
