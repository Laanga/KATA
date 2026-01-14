'use client';

import { Navbar } from "@/components/layout/Navbar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { MediaSearchSection } from "@/components/media/MediaSearchSection";
import { FadeIn } from "@/components/FadeIn";

export default function SeriesPage() {
    return (
        <div className="min-h-screen pb-24 md:pb-0">
            <Navbar />
            <BottomNavigation />
            <main className="container mx-auto px-4 pt-32">
                <FadeIn>
                    <MediaSearchSection
                        type="SERIES"
                        title="Series de TV"
                        description="Encuentra tu próxima serie adictiva. Powered by TMDB."
                    />
                </FadeIn>
            </main>
        </div>
    );
}
