import { Navbar } from "@/components/layout/Navbar";
import { KataCard } from "@/components/media/KataCard";
import { MOCK_MEDIA_ITEMS } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      <main className="container mx-auto px-4 pt-24">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-balance">
            Good Evening, <span className="text-[var(--text-secondary)]">Langa</span>
          </h1>
          <p className="text-[var(--text-tertiary)]">
            You have 3 items in progress.
          </p>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <button className="text-sm text-[var(--accent-primary)] hover:underline">
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {MOCK_MEDIA_ITEMS.map((item) => (
              <KataCard
                key={item.id}
                title={item.title}
                type={item.type}
                coverUrl={item.coverUrl}
                rating={item.rating}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
