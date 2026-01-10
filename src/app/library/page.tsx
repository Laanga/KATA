import { Navbar } from "@/components/layout/Navbar";
import { KataCard } from "@/components/media/KataCard";
import { FilterBar } from "@/components/library/FilterBar";
import { MOCK_MEDIA_ITEMS } from "@/lib/mock-data";

export default function LibraryPage() {
    // Mock duplication to show a "full" library
    const libraryItems = [...MOCK_MEDIA_ITEMS, ...MOCK_MEDIA_ITEMS, ...MOCK_MEDIA_ITEMS];

    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-24">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
                    <p className="text-[var(--text-secondary)] mt-1">18 items in collection</p>
                </header>

                <FilterBar />

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {libraryItems.map((item, index) => (
                        <KataCard
                            key={`${item.id}-${index}`}
                            title={item.title}
                            type={item.type}
                            coverUrl={item.coverUrl}
                            rating={item.rating}
                            status={item.status}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
