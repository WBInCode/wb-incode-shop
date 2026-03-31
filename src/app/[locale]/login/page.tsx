"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { LogIn, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("customer-credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
      } else {
        router.push(`/${locale}/account`);
        router.refresh();
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-28 pb-24 min-h-[70vh] flex items-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              {t("loginTitle")}
            </h1>
            <p className="text-gray-400 text-sm text-center mb-8">
              {t("loginSubtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t("email")}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t("password")}</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading || !email || !password}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("logging")}
                  </>
                ) : (
                  t("login")
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <Link
                href={`/${locale}/reset-password`}
                className="block text-sm text-gray-500 hover:text-primary transition-colors"
              >
                {t("forgotPassword")}
              </Link>
              <p className="text-sm text-gray-500">
                {t("noAccount")}{" "}
                <Link
                  href={`/${locale}/register`}
                  className="text-primary hover:underline"
                >
                  {t("register")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
