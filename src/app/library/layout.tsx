import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteca",
  description: "Explora y gestiona tu biblioteca personal de películas, series, libros y videojuegos. Filtra, ordena y organiza tu colección.",
  openGraph: {
    title: "Biblioteca | Kata",
    description: "Explora y gestiona tu biblioteca personal de películas, series, libros y videojuegos.",
  },
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
