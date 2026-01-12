import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videojuegos",
  description: "Busca y agrega videojuegos a tu biblioteca. Encuentra información detallada de tus juegos favoritos con datos de IGDB.",
  openGraph: {
    title: "Videojuegos | Kata",
    description: "Busca y agrega videojuegos a tu biblioteca personal.",
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
