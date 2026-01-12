import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Películas",
  description: "Busca y agrega películas a tu biblioteca. Encuentra información detallada de tus películas favoritas con datos de TMDB.",
  openGraph: {
    title: "Películas | Kata",
    description: "Busca y agrega películas a tu biblioteca personal.",
  },
};

export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
