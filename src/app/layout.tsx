import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WB InCode Shop — Szablony Stron Internetowych",
  description:
    "Profesjonalne szablony stron internetowych gotowe do użycia. Kup, pobierz i uruchom swoją stronę w kilka minut.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#0a0a0a" }}>
        {children}
      </body>
    </html>
  );
}
