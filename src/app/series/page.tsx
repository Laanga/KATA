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
                        title="Series de TV"
                        description="Encuentra tu próxima serie adictiva. Powered by TMDB."
                    />
                </FadeIn>
            </main>
        </div>
    );
}
