import prisma from "@/lib/prisma";
import AuditLogTable from "@/components/admin/AuditLogTable";

export default async function AuditLogsPage() {
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.auditLog.count(),
  ]);

  const parsedLogs = logs.map((log) => ({
    ...log,
    details: (() => {
      try {
        return JSON.parse(log.details);
      } catch {
        return {};
      }
    })(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-1">
            Historia wszystkich zmian i akcji — łącznie {total} wpisów
          </p>
        </div>
      </div>

      <AuditLogTable initialLogs={parsedLogs} totalLogs={total} />
    </div>
  );
}
