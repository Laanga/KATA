import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Series",
  description: "Busca y agrega series a tu biblioteca. Encuentra información detallada de tus series favoritas con datos de TMDB.",
  openGraph: {
    title: "Series | Kata",
    description: "Busca y agrega series a tu biblioteca personal.",
  },
};

export default function SeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
