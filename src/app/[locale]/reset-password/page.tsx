"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { KeyRound, Loader2, CheckCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const result = await res.json();
        setError(result.error || t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordsNoMatch"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(result.error || t("error"));
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
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              {t("resetTitle")}
            </h1>
            <p className="text-gray-400 text-sm text-center mb-8">
              {token ? "" : t("resetSubtitle")}
            </p>

            {success ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                <p className="text-gray-300">
                  {token ? t("passwordChanged") : t("resetSent")}
                </p>
                <Link
                  href={`/${locale}/login`}
                  className="inline-block text-primary hover:underline text-sm"
                >
                  {t("backToLogin")}
                </Link>
              </div>
            ) : token ? (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t("newPassword")}</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    required
                    minLength={8}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t("confirmNewPassword")}</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    required
                    minLength={8}
                  />
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("settingPassword")}
                    </>
                  ) : (
                    t("setNewPassword")
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
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

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <Button type="submit" className="w-full" disabled={loading || !email}>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("resetSending")}
                    </>
                  ) : (
                    t("resetButton")
                  )}
                </Button>
              </form>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <Link
                  href={`/${locale}/login`}
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  {t("backToLogin")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
