import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Gestiona tu perfil, visualiza tus estadísticas detalladas y revisa tu actividad en Kata.",
  openGraph: {
    title: "Perfil | Kata",
    description: "Gestiona tu perfil y visualiza tus estadísticas detalladas en Kata.",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
