"use client";

import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingBag, FileCheck, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("account");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const links = [
    { href: `/${locale}/account`, label: t("purchases"), icon: ShoppingBag, exact: true },
    { href: `/${locale}/account/licenses`, label: t("licenses"), icon: FileCheck },
    { href: `/${locale}/account/settings`, label: t("settings"), icon: Settings },
  ];

  return (
    <section className="pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">{t("title")}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <nav className="lg:w-64 shrink-0">
            <div className="bg-surface border border-white/5 rounded-2xl p-4 space-y-1">
              {links.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              <button
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                {nav("logout")}
              </button>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
