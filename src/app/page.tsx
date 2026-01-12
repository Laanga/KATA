'use client';

import { Navbar } from "@/components/layout/Navbar";
import { KataCard } from "@/components/media/KataCard";
import { useMediaStore } from "@/lib/store";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { FadeIn } from "@/components/FadeIn";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { StatusDistribution } from "@/components/dashboard/StatusDistribution";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function Home() {
  const router = useRouter();
  const items = useMediaStore((state) => state.items);

  const inProgressStatuses = ['READING', 'PLAYING', 'WATCHING'];
  const inProgressItems = items.filter((item) =>
    inProgressStatuses.includes(item.status)
  );

  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 max-w-7xl">
        <FadeIn direction="up" delay={0.1}>
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-balance">
              Resumen
            </h1>
            <p className="text-[var(--text-secondary)]">
              Bienvenido de nuevo, Langa. Aquí tienes tu biblioteca de un vistazo.
            </p>
          </header>
        </FadeIn>

        <DashboardMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3) - Distributions & In Progress */}
          <div className="lg:col-span-2 space-y-8">
            <StatusDistribution />

            {/* In Progress Section */}
            {inProgressItems.length > 0 && (
              <FadeIn direction="up" scrollTrigger>
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">En Progreso</h2>
                    <button
                      onClick={() => router.push('/library?status=in_progress')}
                      className="text-sm text-[var(--accent-primary)] hover:underline transition-all hover:translate-x-1"
                    >
                      Ver Todo
                    </button>
                  </div>

                  <AnimatedGrid staggerDelay={0.08} className="grid-cols-2 sm:grid-cols-3">
                    {inProgressItems.map((item) => (
                      <KataCard key={item.id} item={item} />
                    ))}
                  </AnimatedGrid>
                </section>
              </FadeIn>
            )}
          </div>

          {/* Right Column (1/3) - Activity Feed */}
          <div className="lg:col-span-1">
            <FadeIn direction="left" delay={0.3}>
              <ActivityFeed />
            </FadeIn>
          </div>
        </div>

        {items.length === 0 && (
          <div className="mt-12">
            <EmptyState
              icon={<BookOpen />}
              title="Tu biblioteca está vacía"
              description="Comienza buscando libros, juegos, películas o series para añadir a tu colección."
              action={{
                label: "Comenzar a Buscar",
                onClick: () => router.push('/books'),
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) {
  return (
    <FadeIn delay={delay} direction="up">
      <div className="group rounded-xl border border-white/5 bg-[var(--bg-secondary)] p-6 transition-all hover:border-white/10 hover:scale-105">
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-[var(--text-tertiary)] font-medium">{label}</div>
        <div className="mt-4 h-1 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min((value / 20) * 100, 100)}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    </FadeIn>
  );
}
