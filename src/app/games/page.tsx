'use client';

import { Navbar } from "@/components/layout/Navbar";
import { MediaSearchSection } from "@/components/media/MediaSearchSection";
import { FadeIn } from "@/components/FadeIn";

export default function GamesPage() {
    return (
        <>
            <div className="min-h-screen pb-24 md:pb-0">
                <Navbar />
                <main className="container mx-auto px-4 pt-32">
                    <FadeIn>
                        <MediaSearchSection
                            type="GAME"
                            title="Juegos"
                            description="Busca juegos de todas las plataformas. Powered by IGDB."
                            showSearchHint={true}
                        />
                    </FadeIn>
                </main>
            </div>
        </>
    );
}
