"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const t = useTranslations("contact");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (
      !data.name.trim() ||
      !data.email.trim() ||
      !data.subject.trim() ||
      !data.message.trim()
    ) {
      setStatus("error");
      setErrorMessage(t("required"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      setStatus("error");
      setErrorMessage(t("invalidEmail"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          _hp: (document.getElementById("_hp_field") as HTMLInputElement)?.value || "",
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setStatus("success");
        setData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(result.error || t("error"));
      }
    } catch {
      setStatus("error");
      setErrorMessage(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot — hidden from users, traps bots */}
      <div className="absolute opacity-0 -z-10" aria-hidden="true">
        <input
          type="text"
          id="_hp_field"
          name="_hp"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Status messages */}
      {status === "success" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
          <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{t("success")}</p>
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">{t("name")}</label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder={t("namePlaceholder")}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">{t("email")}</label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder={t("emailPlaceholder")}
            disabled={loading}
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">{t("subject")}</label>
        <Input
          value={data.subject}
          onChange={(e) => setData({ ...data, subject: e.target.value })}
          placeholder={t("subjectPlaceholder")}
          disabled={loading}
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">{t("message")}</label>
        <textarea
          value={data.message}
          onChange={(e) => setData({ ...data, message: e.target.value })}
          placeholder={t("messagePlaceholder")}
          rows={6}
          disabled={loading}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none"
        />
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {t("sending")}
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {t("send")}
          </>
        )}
      </Button>
    </form>
  );
}
