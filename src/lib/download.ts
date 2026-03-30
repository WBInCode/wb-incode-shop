import crypto from "crypto";

export function generateDownloadToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getDownloadExpiryDate(days: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
