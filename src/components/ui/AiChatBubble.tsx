"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function AiChatBubble() {
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();
  const t = useTranslations("chat");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { locale },
      }),
    [locale]
  );

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport,
  });

  const [input, setInput] = useState("");

  const isLoading = status === "streaming" || status === "submitted";

  // Add welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          parts: [{ type: "text", text: t("welcome") }],
        },
      ]);
    }
  }, [open, messages.length, setMessages, t]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  };

  const getMessageText = (msg: (typeof messages)[number]) => {
    return msg.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";
  };

  return (
    <>
      {/* Floating bubble button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-6 z-[60] p-4 rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_rgba(48,232,122,0.3)] hover:shadow-[0_0_40px_rgba(48,232,122,0.5)] transition-shadow cursor-pointer"
            aria-label={t("open")}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-[60] w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl bg-surface/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/15 border border-primary/20">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t("title")}
                  </h3>
                  <p className="text-xs text-gray-400">{t("subtitle")}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label={t("close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin"
            >
              {messages.map((msg) => {
                const text = getMessageText(msg);
                if (!text) return null;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-white/5 border border-white/5 text-gray-200 rounded-bl-md"
                      }`}
                    >
                      {text}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-2.5">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  </div>
                )}

              {error && (
                <div className="text-center text-xs text-red-400 py-2">
                  {t("error")}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-background/50"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary/40 transition-colors"
                maxLength={500}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(48,232,122,0.3)] transition-all cursor-pointer"
                aria-label={t("send")}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
