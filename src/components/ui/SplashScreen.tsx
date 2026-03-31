"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const MATRIX_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]|;:<>?/~アイウエオカキクケコサシスセソタチツテトナニヌネノ";
const STATUS_MESSAGES = [
  "INICJALIZACJA SYSTEMU...",
  "ŁADOWANIE MODUŁÓW...",
  "KONFIGURACJA VIBE-CODERA...",
  "URUCHAMIANIE ŚRODOWISKA...",
  "KOMPILACJA INTERFEJSU...",
  "SYNCHRONIZACJA DANYCH...",
  "ŁĄCZENIE Z SERWEREM...",
  "WERYFIKACJA ZABEZPIECZEŃ...",
];

function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () =>
      Math.floor(Math.random() * -20)
    );

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 10, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const char =
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > 0.5) {
          ctx.fillStyle = "rgba(48, 232, 122, 0.9)";
          ctx.font = `bold ${fontSize}px monospace`;
        } else {
          ctx.fillStyle = "rgba(48, 232, 122, 0.35)";
          ctx.font = `${fontSize}px monospace`;
        }

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.96) {
          drops[i] = 0;
        }
        drops[i] += Math.random() > 0.5 ? 2 : 3;
      }
    };

    const interval = setInterval(draw, 30);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);

  useEffect(() => {
    setMounted(true);

    // Only show if not already shown this session
    const alreadyShown = sessionStorage.getItem("splash_shown");
    if (alreadyShown) return;

    setVisible(true);

    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 8 + 3;
      if (currentProgress > 95) currentProgress = 95;
      setProgress(currentProgress);
    }, 80);

    const statusInterval = setInterval(() => {
      setStatusText(
        STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)]
      );
    }, 350);

    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      setProgress(100);
      setStatusText("SYSTEM GOTOWY");
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("splash_shown", "1");
      }, 400);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#0a0a0a]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <MatrixCanvas />

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Spinning ring + logo */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/20"
                style={{
                  borderTopColor: "rgb(48, 232, 122)",
                  borderRightColor: "rgba(48, 232, 122, 0.4)",
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute inset-3 rounded-full border border-primary/10"
                style={{ borderBottomColor: "rgba(48, 232, 122, 0.3)" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-5 rounded-full bg-[#0a0a0a]/80 backdrop-blur-sm shadow-[0_0_40px_rgba(48,232,122,0.15)]" />
              <motion.div
                className="relative z-10 w-20 h-20 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Image
                  src="/logo/WB InCode.png"
                  alt="WB InCode"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-[0_0_15px_rgba(48,232,122,0.4)]"
                  priority
                />
              </motion.div>
            </div>

            {/* Status text */}
            <motion.p
              className="text-primary/80 text-xs font-mono tracking-[0.2em] uppercase"
              key={statusText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
            >
              {statusText}
            </motion.p>

            {/* Progress bar */}
            <div className="w-52 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full shadow-[0_0_8px_rgba(48,232,122,0.5)]"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
