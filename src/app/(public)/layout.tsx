import { ToastProvider } from "@/components/ui/ToastProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
