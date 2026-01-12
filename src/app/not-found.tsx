import type { Metadata } from "next";
import NotFoundPage from "./not-found-page";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que buscas no existe o ha sido movida.",
  robots: {
    index: false,
    follow: false,
  },
};

export default NotFoundPage;
