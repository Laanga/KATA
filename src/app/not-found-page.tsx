'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const kanjiRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación del kanji
      gsap.fromTo(
        kanjiRef.current,
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
      );

      // Animación del texto
      gsap.fromTo(
        textRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' }
      );

      // Animación de los botones
      gsap.fromTo(
        buttonsRef.current?.children || [],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.6, ease: 'power3.out' }
      );

      // Animación flotante del kanji
      gsap.to(kanjiRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Kanji 404 */}
        <div className="mb-8">
          <span 
            ref={kanjiRef}
            className="inline-block text-[12rem] md:text-[16rem] font-bold leading-none select-none"
            style={{
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 80px rgba(16, 185, 129, 0.3)',
            }}
          >
            404
          </span>
        </div>

        {/* Text */}
        <div ref={textRef} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Página no encontrada
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto">
            El contenido que buscas no existe o ha sido movido a otro lugar
          </p>
        </div>

        {/* Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            <Home size={18} />
            Ir al inicio
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all duration-300"
          >
            <ArrowLeft size={18} />
            Volver atrás
          </button>

          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all duration-300"
          >
            <Search size={18} />
            Explorar biblioteca
          </Link>
        </div>

        {/* Fun message */}
        <p className="mt-12 text-sm text-[var(--text-tertiary)]">
          <span className="text-emerald-400">型</span> Parece que te has perdido en el dojo...
        </p>
      </div>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    </div>
  );
}
