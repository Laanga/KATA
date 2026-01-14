import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { StoreInitializer } from "@/components/StoreInitializer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider } from "@/components/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto",
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kata.app'),
  title: {
    default: "Kata (型) - Tu biblioteca personal de medios",
    template: "%s | Kata"
  },
  description: "Organiza, trackea y descubre películas, series, libros y videojuegos en un solo lugar. Tu biblioteca personal multimedia con datos reales de APIs profesionales.",
  keywords: ["biblioteca", "medios", "películas", "series", "libros", "videojuegos", "tracking", "organización", "kata"],
  authors: [{ name: "Kata" }],
  creator: "Kata",
  publisher: "Kata",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "Kata",
    title: "Kata (型) - Tu biblioteca personal de medios",
    description: "Organiza, trackea y descubre películas, series, libros y videojuegos en un solo lugar.",
    images: [
      {
        url: "/og-image.png", // Necesitarás crear esta imagen
        width: 1200,
        height: 630,
        alt: "Kata - Biblioteca personal de medios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kata (型) - Tu biblioteca personal de medios",
    description: "Organiza, trackea y descubre películas, series, libros y videojuegos en un solo lugar.",
    images: ["/og-image.png"],
    creator: "@kata", // Cambia por tu Twitter si tienes
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json", // Opcional: para PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={notoSansJP.variable}>
      <body className="antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <SmoothScroll>
              <StoreInitializer />
              <PageTransition>
                {children}
              </PageTransition>
              <ToastProvider />
            </SmoothScroll>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
