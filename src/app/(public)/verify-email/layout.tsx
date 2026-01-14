import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificar Email",
  description: "Verifica tu dirección de email para completar tu registro en Kata.",
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
