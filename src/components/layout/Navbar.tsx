"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const otherLocale = locale === "pl" ? "en" : "pl";
  const { data: session } = useSession();
  const isCustomer = session?.user && (session.user as { role?: string }).role === "customer";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/templates`, label: t("templates") },
    { href: `/${locale}/kontakt`, label: t("contact") },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed -top-20 left-0 right-0 z-50 pt-20 transition-all duration-300 bg-[#0a0a0a] ${
        scrolled ? "glass-nav" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image
              src="/logo/WB InCode.png"
              alt="WB InCode Shop"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-xl font-bold text-gray-500">Shop</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm text-gray-400 hover:text-white transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            {/* Language Switcher */}
            <Link
              href={`/${otherLocale}`}
              className="text-sm text-gray-500 hover:text-primary transition-colors px-3 py-1.5 border border-white/10 rounded-full hover:border-primary/30"
            >
              {t("language")}
            </Link>

            {/* CTA */}
            <Link
              href={`/${locale}/templates`}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:shadow-[0_0_30px_rgba(48,232,122,0.4)] transition-all duration-300"
            >
              {t("templates")}
            </Link>

            {/* Auth */}
            {isCustomer ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-white/10 rounded-full hover:border-primary/30 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{session?.user?.name || t("myAccount")}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <Link
                        href={`/${locale}/account`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        {t("myAccount")}
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: `/${locale}` });
                        }}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-white/10 rounded-full hover:border-primary/30"
              >
                {t("login")}
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden backdrop-blur-xl bg-surface/95 border-t border-white/5"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-gray-400 hover:text-white transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={`/${otherLocale}`}
                className="block text-gray-500 hover:text-primary transition-colors py-2"
              >
                {t("language")}
              </Link>
              <Link
                href={`/${locale}/templates`}
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-5 py-3 bg-primary text-primary-foreground rounded-full font-semibold"
              >
                {t("templates")}
              </Link>
              {isCustomer ? (
                <>
                  <Link
                    href={`/${locale}/account`}
                    onClick={() => setMobileOpen(false)}
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                  >
                    {t("myAccount")}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                    className="block text-gray-400 hover:text-red-400 transition-colors py-2 cursor-pointer"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMobileOpen(false)}
                  className="block text-gray-400 hover:text-white transition-colors py-2"
                >
                  {t("login")}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
