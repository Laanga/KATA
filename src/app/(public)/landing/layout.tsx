import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kata - Tu biblioteca personal de medios",
  description: "Organiza, trackea y descubre películas, series, libros y videojuegos en un solo lugar. Únete a Kata y crea tu biblioteca personal multimedia.",
  openGraph: {
    title: "Kata (型) - Tu biblioteca personal de medios",
    description: "Organiza, trackea y descubre películas, series, libros y videojuegos en un solo lugar.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kata (型) - Tu biblioteca personal de medios",
    description: "Organiza, trackea y descubre películas, series, libros y videojuegos en un solo lugar.",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
