import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AccountLayout from "@/components/account/AccountLayout";

export default async function AccountRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session || role !== "customer") {
    redirect("/pl/login");
  }

  return <AccountLayout>{children}</AccountLayout>;
}
