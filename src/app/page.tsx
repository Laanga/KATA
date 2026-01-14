import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Resumen de tu biblioteca personal. Visualiza tus estadísticas, items en progreso y actividad reciente.",
  openGraph: {
    title: "Home | Kata",
    description: "Resumen de tu biblioteca personal. Visualiza tus estadísticas, items en progreso y actividad reciente.",
  },
};

export { default } from "./dashboard";
