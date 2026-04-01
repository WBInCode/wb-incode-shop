"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  ShoppingCart,
  User,
  Shield,
  Zap,
  Search,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  actor: string;
  actorType: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: Date;
}

interface AuditLogTableProps {
  initialLogs: AuditLog[];
  totalLogs: number;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  "product.create": { label: "Utworzono produkt", color: "text-emerald-400 bg-emerald-400/10" },
  "product.update": { label: "Zaktualizowano produkt", color: "text-blue-400 bg-blue-400/10" },
  "product.patch": { label: "Zmieniono produkt", color: "text-blue-400 bg-blue-400/10" },
  "product.delete": { label: "Usunięto produkt", color: "text-red-400 bg-red-400/10" },
  "order.create": { label: "Nowe zamówienie", color: "text-purple-400 bg-purple-400/10" },
  "order.paid": { label: "Zamówienie opłacone", color: "text-emerald-400 bg-emerald-400/10" },
  "order.cancelled": { label: "Zamówienie anulowane", color: "text-red-400 bg-red-400/10" },
  "user.reset-password": { label: "Reset hasła", color: "text-yellow-400 bg-yellow-400/10" },
  "user.deactivate": { label: "Dezaktywacja konta", color: "text-orange-400 bg-orange-400/10" },
  "user.activate": { label: "Aktywacja konta", color: "text-emerald-400 bg-emerald-400/10" },
  "user.delete": { label: "Usunięto konto", color: "text-red-400 bg-red-400/10" },
};

const ENTITY_ICONS: Record<string, typeof Package> = {
  product: Package,
  order: ShoppingCart,
  user: User,
};

const ACTOR_TYPE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  system: Zap,
  customer: User,
};

const ENTITY_OPTIONS = [
  { value: "", label: "Wszystkie" },
  { value: "product", label: "Produkty" },
  { value: "order", label: "Zamówienia" },
  { value: "user", label: "Użytkownicy" },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

function formatDetails(details: Record<string, unknown>): string {
  const entries = Object.entries(details).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );
  if (entries.length === 0) return "";
  return entries
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
    .join(" · ");
}

export default function AuditLogTable({ initialLogs, totalLogs }: AuditLogTableProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [total, setTotal] = useState(totalLogs);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [entityFilter, setEntityFilter] = useState("");
  const [actorSearch, setActorSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPages = Math.ceil(total / 50);

  const fetchLogs = async (newPage: number, entity?: string, actor?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: newPage.toString(), limit: "50" });
    if (entity) params.set("entity", entity);
    if (actor) params.set("actor", actor);

    try {
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setPage(data.page);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleEntityFilter = (entity: string) => {
    setEntityFilter(entity);
    setPage(1);
    fetchLogs(1, entity, actorSearch);
  };

  const handleActorSearch = () => {
    setPage(1);
    fetchLogs(1, entityFilter, actorSearch);
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">Filtruj:</span>
          </div>

          <div className="flex gap-2">
            {ENTITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleEntityFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  entityFilter === opt.value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[200px] flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={actorSearch}
                onChange={(e) => setActorSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleActorSearch()}
                placeholder="Szukaj po aktorze (email)..."
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-primary/50"
              />
            </div>
            <button
              onClick={handleActorSearch}
              className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Szukaj
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`bg-surface border border-white/5 rounded-2xl overflow-hidden transition-opacity ${loading ? "opacity-50" : ""}`}>
        {logs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500">Brak wpisów w audit logu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">Data</th>
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">Akcja</th>
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">Aktor</th>
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">Szczegóły</th>
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const actionInfo = ACTION_LABELS[log.action] || {
                    label: log.action,
                    color: "text-gray-400 bg-white/5",
                  };
                  const EntityIcon = ENTITY_ICONS[log.entity] || Package;
                  const ActorIcon = ACTOR_TYPE_ICONS[log.actorType] || User;
                  const isExpanded = expandedId === log.id;
                  const detailsStr = formatDetails(log.details);

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer"
                    >
                      <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <EntityIcon className="w-3.5 h-3.5 text-gray-500" />
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${actionInfo.color}`}
                          >
                            {actionInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <ActorIcon className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-300">{log.actor}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isExpanded ? (
                          <pre className="text-xs text-gray-400 whitespace-pre-wrap max-w-md">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-xs text-gray-500 truncate block max-w-xs">
                            {detailsStr || "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">
                        {log.ipAddress || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-xs text-gray-500">
              Strona {page} z {totalPages} ({total} wpisów)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(page - 1, entityFilter, actorSearch)}
                disabled={page <= 1}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchLogs(page + 1, entityFilter, actorSearch)}
                disabled={page >= totalPages}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
