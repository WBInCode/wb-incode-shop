import crypto from "crypto";

export function generateDownloadToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
