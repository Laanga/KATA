'use client';

import { Navbar } from "@/components/layout/Navbar";
import { MediaSearchSection } from "@/components/media/MediaSearchSection";
import { FadeIn } from "@/components/FadeIn";

export default function SeriesPage() {
    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <main className="container mx-auto px-4 pt-32">
                <FadeIn>
                    <MediaSearchSection
                        type="SERIES"
                        title="TV Series"
                        description="Find your next binge-worthy show. Powered by TMDB."
                    />
                </FadeIn>
            </main>
        </div>
    );
}
