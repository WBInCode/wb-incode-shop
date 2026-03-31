"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AccountSettingsPage() {
  const t = useTranslations("account");
  const { data: session, update } = useSession();

  const [name, setName] = useState(session?.user?.name || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState<"idle" | "success" | "error">("idle");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus("idle");
    setProfileLoading(true);

    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setProfileStatus("success");
        await update({ name });
      } else {
        setProfileStatus("error");
      }
    } catch {
      setProfileStatus("error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus("idle");
    setPasswordError("");
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await res.json();

      if (res.ok) {
        setPasswordStatus("success");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordStatus("error");
        setPasswordError(result.error || t("error"));
      }
    } catch {
      setPasswordStatus("error");
      setPasswordError(t("error"));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-white">{t("settingsTitle")}</h2>

      {/* Profile Section */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">{t("profileSection")}</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <Input value={session?.user?.email || ""} disabled className="opacity-50" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t("purchases") === "Moje zakupy" ? "Imię" : "Name"}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={profileLoading}
            />
          </div>

          {profileStatus === "success" && (
            <div className="flex items-center gap-2 text-primary text-sm">
              <CheckCircle className="w-4 h-4" />
              {t("profileSaved")}
            </div>
          )}

          <Button type="submit" disabled={profileLoading}>
            {profileLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t("saving")}
              </>
            ) : (
              t("saveProfile")
            )}
          </Button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">{t("passwordSection")}</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t("currentPassword")}</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={passwordLoading}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t("newPassword")}</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              disabled={passwordLoading}
            />
          </div>

          {passwordStatus === "success" && (
            <div className="flex items-center gap-2 text-primary text-sm">
              <CheckCircle className="w-4 h-4" />
              {t("passwordChanged")}
            </div>
          )}

          {passwordStatus === "error" && passwordError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {passwordError}
            </div>
          )}

          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t("saving")}
              </>
            ) : (
              t("changePassword")
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
