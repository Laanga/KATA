'use client';

import { Navbar } from "@/components/layout/Navbar";
import { MediaSearchSection } from "@/components/media/MediaSearchSection";
import { FadeIn } from "@/components/FadeIn";

export default function BooksPage() {
    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <main className="container mx-auto px-4 pt-32">
                <FadeIn>
                    <MediaSearchSection
                        type="BOOK"
                        title="Libros"
                        description="Explora millones de libros. Powered by Google Books."
                    />
                </FadeIn>
            </main>
        </div>
    );
}
