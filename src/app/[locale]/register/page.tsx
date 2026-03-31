"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { UserPlus, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordsNoMatch"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || t("error"));
        return;
      }

      // Auto-login after registration
      const signInResult = await signIn("customer-credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push(`/${locale}/login`);
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
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              {t("registerTitle")}
            </h1>
            <p className="text-gray-400 text-sm text-center mb-8">
              {t("registerSubtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t("name")}</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t("email")}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
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
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t("confirmPassword")}</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("registering")}
                  </>
                ) : (
                  t("register")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {t("haveAccount")}{" "}
                <Link
                  href={`/${locale}/login`}
                  className="text-primary hover:underline"
                >
                  {t("login")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
