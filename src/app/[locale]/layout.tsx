import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
import AiChatBubble from "@/components/ui/AiChatBubble";
import GlobalBackground from "@/components/ui/GlobalBackground";
import PageTransition from "@/components/ui/PageTransition";

type Params = Promise<{ locale: string }>;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "pl" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SessionProvider>
        <GlobalBackground />
        <PageTransition />
        <div className="relative z-10 flex flex-col min-h-full">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CookieConsent />
        <AiChatBubble />
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
