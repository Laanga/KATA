import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elige tu Nombre de Usuario",
  description: "Completa tu registro eligiendo un nombre de usuario único.",
};

export default function ChooseUsernameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
