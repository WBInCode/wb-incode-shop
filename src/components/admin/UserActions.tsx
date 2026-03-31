"use client";

import { useState, useEffect, useCallback } from "react";
import { KeyRound, UserX, UserCheck, Trash2, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  userName: string;
  userEmail: string;
  isActive: boolean;
}

type ConfirmAction = "deactivate" | "delete" | null;

export default function UserActions({ userId, userName, userEmail, isActive }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [countdown, setCountdown] = useState(5);

  const displayName = userName || userEmail;

  // Countdown timer for confirm modal
  useEffect(() => {
    if (confirmAction === null) return;
    setCountdown(5);
    setConfirmInput("");
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [confirmAction]);

  const performAction = useCallback(async (action: string) => {
    setLoading(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        if (action === "delete") {
          setTimeout(() => router.push("/admin/users"), 1500);
        } else {
          router.refresh();
        }
      } else {
        setMessage({ type: "error", text: data.error || "Wystąpił błąd" });
      }
    } catch {
      setMessage({ type: "error", text: "Błąd połączenia z serwerem" });
    } finally {
      setLoading(false as unknown as string);
      setConfirmAction(null);
    }
  }, [userId, router]);

  const handleConfirm = () => {
    if (!confirmAction || countdown > 0 || confirmInput !== displayName) return;
    performAction(confirmAction);
  };

  const canConfirm = countdown === 0 && confirmInput === displayName;

  return (
    <>
      {/* Action buttons */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Zarządzanie kontem</h2>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {/* Reset password */}
          <button
            onClick={() => performAction("reset-password")}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            {loading === "reset-password" ? "Wysyłanie..." : "Resetuj hasło"}
          </button>

          {/* Deactivate / Activate */}
          {isActive ? (
            <button
              onClick={() => setConfirmAction("deactivate")}
              disabled={loading !== null}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl text-sm font-medium hover:bg-yellow-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <UserX className="w-4 h-4" />
              Dezaktywuj konto
            </button>
          ) : (
            <button
              onClick={() => performAction("activate")}
              disabled={loading !== null}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              {loading === "activate" ? "Aktywowanie..." : "Aktywuj konto"}
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => setConfirmAction("delete")}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Usuń konto
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmAction === "delete" ? "bg-red-500/20" : "bg-yellow-500/20"
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${
                    confirmAction === "delete" ? "text-red-400" : "text-yellow-400"
                  }`} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {confirmAction === "delete" ? "Usuń konto" : "Dezaktywuj konto"}
                </h3>
              </div>
              <button
                onClick={() => setConfirmAction(null)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              {confirmAction === "delete"
                ? "Ta operacja jest nieodwracalna. Konto użytkownika zostanie trwale usunięte. Historia zamówień zostanie zachowana."
                : "Użytkownik nie będzie mógł się zalogować do momentu ponownej aktywacji konta."}
            </p>

            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-2">
                Aby potwierdzić, przepisz nazwę konta:
              </p>
              <div className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 mb-3 select-all">
                <span className="text-primary font-mono text-sm">{displayName}</span>
              </div>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Przepisz nazwę konta..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2.5 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Anuluj
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm || loading !== null}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  canConfirm
                    ? confirmAction === "delete"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-yellow-500 text-black hover:bg-yellow-600"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                } disabled:opacity-50`}
              >
                {countdown > 0 ? (
                  `Poczekaj ${countdown}s...`
                ) : loading ? (
                  "Wykonywanie..."
                ) : confirmAction === "delete" ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Usuń trwale
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    Dezaktywuj
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
