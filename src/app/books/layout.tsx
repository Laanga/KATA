import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Libros",
  description: "Busca y agrega libros a tu biblioteca. Encuentra información detallada de tus libros favoritos con datos de Google Books.",
  openGraph: {
    title: "Libros | Kata",
    description: "Busca y agrega libros a tu biblioteca personal.",
  },
};

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
