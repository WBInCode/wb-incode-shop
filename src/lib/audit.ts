import prisma from "@/lib/prisma";

interface AuditLogEntry {
  action: string;
  entity: string;
  entityId?: string;
  actor: string;
  actorType?: "admin" | "system" | "customer";
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function auditLog({
  action,
  entity,
  entityId,
  actor,
  actorType = "admin",
  details = {},
  ipAddress,
}: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId: entityId || null,
        actor,
        actorType,
        details: JSON.stringify(details),
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}

export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return undefined;
}
