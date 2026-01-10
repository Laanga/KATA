import { Navbar } from "@/components/layout/Navbar";
import { Settings, ChartNoAxesCombined, BookOpen, Gamepad2, Tv, Film } from 'lucide-react';
import { KataCard } from "@/components/media/KataCard";
import { MOCK_MEDIA_ITEMS } from "@/lib/mock-data";

export default function ProfilePage() {
    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 max-w-5xl">
                {/* Header Profile */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-primary)] border-2 border-[var(--accent-primary)] shadow-2xl flex items-center justify-center text-4xl">
                            🧘
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Langa</h1>
                            <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-primary)]"></span>
                                Black Belt Media Consumer
                            </p>
                            <p className="text-[var(--text-tertiary)] text-sm mt-1">Joined January 2026</p>
                        </div>
                    </div>

                    <button className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-2">
                        <Settings size={16} />
                        Edit Profile
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    <StatCard
                        icon={<BookOpen size={20} />}
                        label="Books Read"
                        value="23"
                        color="text-[var(--color-book)]"
                        trend="+2 this month"
                    />
                    <StatCard
                        icon={<Gamepad2 size={20} />}
                        label="Games Beaten"
                        value="12"
                        color="text-[var(--color-game)]"
                        trend="+1 this month"
                    />
                    <StatCard
                        icon={<Tv size={20} />}
                        label="Series Watched"
                        value="18"
                        color="text-[var(--color-series)]"
                        trend="On break"
                    />
                    <StatCard
                        icon={<Film size={20} />}
                        label="Movies Seen"
                        value="45"
                        color="text-[var(--color-movie)]"
                        trend="+4 this month"
                    />
                </div>

                {/* Content Tabs */}
                <div className="border-b border-white/10 mb-8">
                    <div className="flex gap-8">
                        <TabItem label="Overview" active />
                        <TabItem label="History" />
                        <TabItem label="Reviews" />
                        <TabItem label="Lists" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Stats & Activity */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Activity Heatmap Mock */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <ChartNoAxesCombined className="text-[var(--accent-primary)]" />
                                <h2 className="text-xl font-semibold">Kata Consistency</h2>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-[var(--bg-secondary)] p-8">
                                <div className="h-32 flex items-end justify-between gap-1">
                                    {Array.from({ length: 40 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-full rounded-sm bg-[var(--accent-primary)]"
                                            style={{
                                                height: `${Math.random() * 100}%`,
                                                opacity: Math.random() < 0.2 ? 0.1 : Math.random() * 0.8 + 0.2
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 text-xs text-[var(--text-tertiary)] font-mono">
                                    <span>Jan 1</span>
                                    <span>Daily Activity</span>
                                    <span>Today</span>
                                </div>
                            </div>
                        </section>

                        {/* Recent Favorites */}
                        <section>
                            <h2 className="text-xl font-semibold mb-6">Recent Favorites</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {MOCK_MEDIA_ITEMS.slice(0, 3).map((item) => (
                                    <KataCard
                                        key={`fav-${item.id}`}
                                        title={item.title}
                                        type={item.type}
                                        coverUrl={item.coverUrl}
                                        rating={item.rating}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Recent Updates */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-lg font-semibold mb-4 text-[var(--text-secondary)]">Activity Log</h2>
                            <div className="relative border-l border-white/10 pl-6 space-y-8 py-2">
                                <TimelineItem
                                    title="Completed Dune"
                                    date="2 days ago"
                                    type="BOOK"
                                    desc="Rated 5 stars. Masterpiece."
                                />
                                <TimelineItem
                                    title="Started Elden Ring"
                                    date="1 week ago"
                                    type="GAME"
                                    desc="Prepare to die edition."
                                />
                                <TimelineItem
                                    title="Watched Oppenheimer"
                                    date="2 weeks ago"
                                    type="MOVIE"
                                    desc="Mind blowing visuals."
                                />
                            </div>
                        </section>
                    </div>
                </div>

            </main>
        </div>
    );
}

function StatCard({ label, value, color, icon, trend }: { label: string, value: string, color: string, icon: React.ReactNode, trend: string }) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-[var(--bg-secondary)] p-6 hover:border-[var(--accent-primary)]/30 transition-all duration-300">
            <div className={`mb-4 ${color} opacity-80`}>{icon}</div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-[var(--text-tertiary)] font-medium">{label}</div>
            <div className="mt-4 text-xs font-mono text-[var(--text-tertiary)] opacity-50 group-hover:opacity-100 transition-opacity">
                {trend}
            </div>
        </div>
    );
}

function TabItem({ label, active }: { label: string, active?: boolean }) {
    return (
        <button className={`pb-4 text-sm font-medium transition-colors relative ${active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)] hover:text-white'}`}>
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]"></div>}
        </button>
    )
}

function TimelineItem({ title, date, type, desc }: { title: string, date: string, type: string, desc: string }) {
    const getColor = (t: string) => {
        switch (t) {
            case 'BOOK': return 'bg-[var(--color-book)]';
            case 'GAME': return 'bg-[var(--color-game)]';
            case 'MOVIE': return 'bg-[var(--color-movie)]';
            case 'SERIES': return 'bg-[var(--color-series)]';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="relative">
            <span className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full ${getColor(type)} ring-4 ring-black`} />
            <h4 className="text-sm font-medium text-white">{title}</h4>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{date}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-2 italic">"{desc}"</p>
        </div>
    )
}
