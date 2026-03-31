"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Search } from "lucide-react";

interface Order {
  id: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  downloadToken: string;
  createdAt: Date;
  product: { namePl: string };
  variant: { namePl: string };
}

interface OrderTableProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-400/10 text-emerald-400",
  PENDING: "bg-yellow-400/10 text-yellow-400",
  CANCELLED: "bg-red-400/10 text-red-400",
  REFUNDED: "bg-blue-400/10 text-blue-400",
};

export default function OrderTable({ orders }: OrderTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = orders.filter((order) => {
    const matchesSearch = order.email
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po emailu..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none text-sm focus:border-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["all", "PAID", "PENDING", "CANCELLED", "REFUNDED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              {status === "all" ? "Wszystkie" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                    Email
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                    Produkt
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                    Wariant
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                    Kwota
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                    Status
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="py-4 px-6 text-white text-sm">
                      {order.email}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
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
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status] || statusColors.PENDING
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
          <p className="text-gray-500 text-center py-10">
            Brak zamówień do wyświetlenia.
          </p>
        )}
      </div>
    </div>
  );
}
