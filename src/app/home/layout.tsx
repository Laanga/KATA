import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Resumen de tu biblioteca personal. Visualiza tus estadísticas, items en progreso y actividad reciente.",
  openGraph: {
    title: "Home",
    description: "Resumen de tu biblioteca personal. Visualiza tus estadísticas, items en progreso y actividad reciente.",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
