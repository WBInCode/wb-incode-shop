"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathname = useRef(pathname);

  // Intercept internal link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href === pathname ||
        anchor.target === "_blank"
      )
        return;

      e.preventDefault();
      setIsLoading(true);
      setProgress(15);

      let p = 15;
      const interval = setInterval(() => {
        p += Math.random() * 20 + 10;
        if (p > 90) p = 90;
        setProgress(p);
      }, 80);

      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        router.push(href);
      }, 250);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname, router]);

  // Hide loading after route changes
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 100);
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Green progress bar at the very top */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-[9999] h-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(48,232,122,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            />
          </motion.div>

          {/* Centered spinner */}
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
