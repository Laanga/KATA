'use client';

import { Navbar } from "@/components/layout/Navbar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { MediaSearchSection } from "@/components/media/MediaSearchSection";
import { FadeIn } from "@/components/FadeIn";

export default function MoviesPage() {
    return (
        <>
            <div className="min-h-screen pb-24 md:pb-0">
                <Navbar />
                <main className="container mx-auto px-4 pt-32">
                    <FadeIn>
                        <MediaSearchSection
                            type="MOVIE"
                            title="Películas"
                            description="Descubre películas populares y tendencias. Powered by TMDB."
                        />
                    </FadeIn>
                </main>
            </div>
            <BottomNavigation />
        </>
    );
}
