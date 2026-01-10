import { Navbar } from "@/components/layout/Navbar";
import { SearchInput } from "@/components/search/SearchInput";
import { KataCard } from "@/components/media/KataCard";
import { MOCK_MEDIA_ITEMS } from "@/lib/mock-data";

export default function SearchPage() {
    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 flex flex-col items-center">
                <div className="w-full text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">What's next?</h1>
                    <SearchInput />
                </div>

                {/* Mock Results Area */}
                <div className="w-full mt-12">
                    <h2 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-6">Trending Now</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {MOCK_MEDIA_ITEMS.slice(0, 4).map((item) => (
                            <KataCard
                                key={`search-${item.id}`}
                                title={item.title}
                                type={item.type}
                                coverUrl={item.coverUrl}
                                rating={item.rating}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
