import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Descubrir | Kata",
  description: "Descubre próximos lanzamientos de películas, series, libros y juegos, además de recomendaciones personalizadas basadas en tus gustos.",
  openGraph: {
    title: "Descubrir | Kata",
    description: "Próximos lanzamientos y recomendaciones personalizadas",
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
