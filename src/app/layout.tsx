import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { StoreInitializer } from "@/components/StoreInitializer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { PageTransition } from "@/components/PageTransition";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Kata (型)",
  description: "Your media kata. Track books, games, movies, and series.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SmoothScroll>
          <StoreInitializer />
          <PageTransition>
            {children}
          </PageTransition>
          <ToastProvider />
        </SmoothScroll>
      </body>
    </html>
  );
}
