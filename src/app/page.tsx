'use client';
import { ButtonLink } from '@/components/ui/Button';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BookOpen,
  Gamepad2,
  Film,
  Tv,
  ArrowRight,
  Sparkles,
  Search,
  Plus,
  Star,
  BarChart3,
  Check,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';
import { ParticleBackground } from '@/components/ui/ParticleBackground';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const kanjiRef = useRef<HTMLDivElement>(null);
  const kanjiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTl
        .fromTo(
          kanjiRef.current,
          {
            scale: 0,
            opacity: 0,
            rotateY: -90,
          },
          {
            scale: 1,
            opacity: 1,
            rotateY: 0,
            duration: 1.5,
            ease: 'elastic.out(1, 0.5)',
          },
        )
        .fromTo(
          '.kanji-glow',
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 1 },
          '-=1',
        )
        .fromTo('.hero-title', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
        .fromTo(
          '.hero-subtitle',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.4',
        )
        .fromTo('.hero-cta', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
        .fromTo('.scroll-indicator', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2');

      gsap.to(kanjiRef.current, {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.kanji-glow', {
        rotate: 360,
        duration: 25,
        repeat: -1,
        ease: 'none',
      });

      gsap.to(kanjiContainerRef.current, {
        y: 100,
        scale: 0.9,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      gsap.utils.toArray<HTMLElement>('.section-header').forEach((header) => {
        gsap.fromTo(
          header,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          {
            y: 80,
            opacity: 0,
            rotateX: 20,
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.7,
            delay: i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.step-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          {
            x: i % 2 === 0 ? -60 : 60,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.benefit-item').forEach((item, i) => {
        gsap.fromTo(
          item,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            delay: i * 0.1,
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.stat-number').forEach((stat) => {
        const value = stat.getAttribute('data-value');
        if (value && !isNaN(Number(value))) {
          gsap.fromTo(
            stat,
            { innerText: '0' },
            {
              innerText: value,
              duration: 2,
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: stat,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            },
          );
        }
      });

      gsap.utils.toArray<HTMLElement>('.animated-line').forEach((line, i) => {
        gsap.fromTo(
          line,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 0.1,
            duration: 2,
            delay: i * 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 90%',
            },
          },
        );
      });

      gsap.fromTo(
        '.final-cta',
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.final-cta',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Libros',
      description: 'Organiza tu biblioteca personal. Desde novelas épicas hasta manga y cómics.',
      color: 'var(--color-book)',
      rgb: '139, 92, 246',
    },
    {
      icon: Gamepad2,
      title: 'Juegos',
      description: 'Tu backlog de videojuegos bajo control. PC, consolas, móvil... todo en uno.',
      color: 'var(--color-game)',
      rgb: '239, 68, 68',
    },
    {
      icon: Film,
      title: 'Películas',
      description: 'Organiza tu watchlist cinematográfica. Nunca olvides una recomendación.',
      color: 'var(--color-movie)',
      rgb: '59, 130, 246',
    },
    {
      icon: Tv,
      title: 'Series',
      description: 'Rastrea cada temporada y episodio. Sabe exactamente dónde lo dejaste.',
      color: 'var(--color-series)',
      rgb: '16, 185, 129',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Busca',
      description:
        'Encuentra libros, juegos, películas y series usando nuestra búsqueda integrada con bases de datos globales.',
    },
    {
      number: '02',
      icon: Plus,
      title: 'Añade',
      description:
        'Agrega cualquier título a tu biblioteca con un solo click. Elige su estado: quiero ver, viendo, completado...',
    },
    {
      number: '03',
      icon: Star,
      title: 'Valora',
      description:
        'Puntúa y escribe reseñas para recordar qué te pareció cada obra. Tu opinión, tu historia.',
    },
    {
      number: '04',
      icon: BarChart3,
      title: 'Analiza',
      description:
        'Visualiza estadísticas de tu consumo de medios. Descubre patrones y celebra tu progreso.',
    },
  ];

  const benefits = [
    { icon: Zap, text: 'Interfaz rápida y fluida' },
    { icon: Shield, text: 'Tus datos seguros en la nube' },
    { icon: Clock, text: 'Sincronización en tiempo real' },
    { icon: Sparkles, text: 'Diseño minimalista japonés' },
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-black w-full max-w-full landing-container"
    >
      <ParticleBackground />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animated-line absolute h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
            style={{
              top: `${20 + i * 18}%`,
              left: 0,
              right: 0,
              transformOrigin: 'left',
            }}
          />
        ))}
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-emerald-400">型</span>
            <span className="hidden min-[380px]:inline text-lg font-bold text-white">Kata</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <ButtonLink size="sm" variant="ghost" href="/login">
              Iniciar sesión
            </ButtonLink>
            <ButtonLink size="sm" variant="primary" href="/signup">
              Registrarse
            </ButtonLink>
          </div>
        </div>
      </nav>

      <section
        ref={heroRef}
        className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 pt-28 pb-20 sm:pt-32"
      >
        <div ref={kanjiContainerRef} className="relative mb-4 sm:mb-6">
          <div ref={kanjiRef} style={{ perspective: '1000px' }}>
            <div className="kanji-glow absolute inset-0 blur-3xl opacity-40 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-br from-emerald-500/60 via-emerald-400/40 to-transparent rounded-full" />
            </div>

            <span
              className="relative block leading-none select-none font-bold"
              style={{
                fontSize: 'clamp(96px, 26vw, 260px)',
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 80px rgba(16, 185, 129, 0.4)',
                fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif',
              }}
            >
              型
            </span>

            <div className="absolute inset-0 -m-4 sm:-m-6 border border-emerald-500/20 rounded-full animate-pulse pointer-events-none" />
            <div className="absolute inset-0 -m-8 sm:-m-12 border border-emerald-500/10 rounded-full pointer-events-none" />
          </div>
        </div>

        <div className="hero-title text-center mb-3 sm:mb-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter">
            <span className="text-white">Kata</span>
          </h1>
        </div>

        <div className="hero-subtitle text-center max-w-2xl mb-8 sm:mb-10 px-2">
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-3">
            Tu <span className="text-emerald-400 font-semibold">biblioteca personal</span> para
            organizar
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            libros, juegos, películas y series.
          </p>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] font-light">
            形 (kata) — La forma perfecta a través de la práctica
          </p>
        </div>

        <div className="hero-cta flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
          <ButtonLink size="lg" variant="primary" href="/signup" className="group">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Comenzar Gratis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </ButtonLink>

          <ButtonLink size="lg" variant="secondary" href="/login" className="group">
            Ya tengo cuenta
          </ButtonLink>
        </div>

        <div className="scroll-indicator absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-tertiary)]">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest">Descubre más</span>
          <div className="w-px h-8 bg-gradient-to-b from-emerald-500/50 to-transparent animate-pulse" />
        </div>
      </section>

      <section className="relative z-10 py-20 sm:py-28 lg:py-32 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="section-header text-center mb-12 sm:mb-16">
            <span className="liquid-glass-soft inline-block px-4 py-1.5 text-[10px] sm:text-xs font-medium text-emerald-400 rounded-full border border-emerald-400/20 mb-4 tracking-widest">
              CARACTERÍSTICAS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Todo tu entretenimiento,
              <br />
              un solo lugar
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto px-2">
              Organiza y rastrea todo lo que consumes. Sin complicaciones, con elegancia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-md sm:max-w-none mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="kata-panel kata-panel--subtle feature-card group relative p-6 sm:p-7 overflow-hidden transition-all duration-500 hover:-translate-y-1"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, rgba(${feature.rgb}, 0.18) 0%, transparent 70%)`,
                  }}
                />

                <div
                  className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-[var(--kata-radius-control)] flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(180deg, rgba(${feature.rgb}, 0.22) 0%, rgba(${feature.rgb}, 0.10) 100%)`,
                    boxShadow: `inset 0 0 0 1px rgba(${feature.rgb}, 0.28)`,
                  }}
                >
                  <feature.icon size={26} style={{ color: feature.color }} />
                </div>

                <h3 className="relative text-lg sm:text-xl font-semibold text-white mb-2.5">
                  {feature.title}
                </h3>
                <p className="relative text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>

                <div
                  className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-40 pointer-events-none"
                  style={{ backgroundColor: feature.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 sm:py-28 lg:py-32 px-6 sm:px-8 overflow-hidden">
        <div className="max-w-3xl mx-auto">
          <div className="section-header text-center mb-14 sm:mb-20">
            <span className="liquid-glass-soft inline-block px-4 py-1.5 text-[10px] sm:text-xs font-medium text-emerald-400 rounded-full border border-emerald-400/20 mb-4 tracking-widest">
              CÓMO FUNCIONA
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Simple como debe ser
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto px-2">
              Cuatro pasos para organizar tu vida de entretenimiento.
            </p>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="kata-panel kata-panel--subtle step-card relative flex flex-col sm:flex-row items-start gap-4 sm:gap-8 p-6 sm:p-8 transition-all"
              >
                <div className="flex-shrink-0 flex sm:block items-center gap-4">
                  <span className="text-5xl sm:text-7xl md:text-8xl font-bold text-emerald-500/20 leading-none">
                    {step.number}
                  </span>
                  <div className="kata-icon-well sm:hidden w-12 h-12">
                    <step.icon size={22} className="text-emerald-400" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="hidden sm:flex items-center gap-4 mb-4">
                    <div className="kata-icon-well w-12 h-12">
                      <step.icon size={24} className="text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  </div>
                  <h3 className="sm:hidden text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 sm:py-28 lg:py-32 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="section-header mb-8">
                <span className="liquid-glass-soft inline-block px-4 py-1.5 text-[10px] sm:text-xs font-medium text-emerald-400 rounded-full border border-emerald-400/20 mb-4 tracking-widest">
                  ¿POR QUÉ KATA?
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                  Diseñado para ti
                </h2>
                <p className="text-base sm:text-lg text-[var(--text-secondary)]">
                  Kata nace de la filosofía japonesa de la mejora continua. Cada detalle está
                  pensado para hacer tu experiencia simple y satisfactoria.
                </p>
              </div>

              <div className="space-y-3">
                {benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="kata-panel kata-panel--subtle benefit-item flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5"
                  >
                    <div className="kata-icon-well w-10 h-10">
                      <benefit.icon size={18} className="text-emerald-400" />
                    </div>
                    <span className="text-sm sm:text-base text-white font-medium">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="feature-card relative">
              <div className="kata-panel aspect-square p-6 sm:p-8 flex items-center justify-center overflow-hidden">
                <span
                  className="text-[200px] sm:text-[260px] font-bold opacity-[0.04] select-none absolute"
                  style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                >
                  型
                </span>

                <div className="relative w-full max-w-xs">
                  <div className="space-y-3">
                    {['Libro actual', 'Juego en progreso', 'Serie siguiendo'].map((item, i) => (
                      <div
                        key={i}
                        className="kata-panel kata-panel--subtle flex items-center gap-3 p-3"
                      >
                        <div className="w-8 h-10 rounded bg-gradient-to-br from-white/20 to-white/5" />
                        <div className="flex-1">
                          <div className="h-2 w-24 bg-white/20 rounded mb-1.5" />
                          <div className="h-1.5 w-16 bg-white/10 rounded" />
                          <div className="sr-only">{item}</div>
                        </div>
                        <Check size={16} className="text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-6 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: '4', label: 'Tipos de media', suffix: '' },
              { value: '∞', label: 'Items ilimitados', suffix: '' },
              { value: '100', label: 'Gratis', suffix: '%' },
              { value: '0', label: 'Anuncios', suffix: '' },
            ].map((stat, i) => (
              <div
                key={i}
                className="kata-panel kata-panel--subtle feature-card text-center p-5 sm:p-6 transition-all hover:-translate-y-0.5"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-400 mb-1.5 sm:mb-2">
                  {stat.value === '∞' ? (
                    <span>∞</span>
                  ) : (
                    <>
                      <span className="stat-number" data-value={stat.value}>
                        {stat.value}
                      </span>
                      {stat.suffix}
                    </>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 sm:py-28 lg:py-32 px-6 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="kata-panel final-cta relative p-8 sm:p-12 md:p-20 overflow-hidden text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl" />
              <span
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[220px] sm:text-[300px] font-bold opacity-[0.04] select-none"
                style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
              >
                型
              </span>
            </div>

            <div className="relative">
              <div className="kata-icon-well mx-auto mb-6 h-14 w-14">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 sm:mb-6 tracking-tight">
                Empieza tu kata hoy
              </h2>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] mb-8 sm:mb-10 max-w-xl mx-auto px-2">
                Únete a Kata y comienza a organizar tu biblioteca personal de medios. Gratis para
                siempre. Sin anuncios. Sin límites.
              </p>

              <ButtonLink size="lg" variant="primary" href="/signup" className="group">
                Crear cuenta gratis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </ButtonLink>

              <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-[var(--text-tertiary)]">
                Configuración en 30 segundos
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-emerald-400">型</span>
            <span className="text-lg font-semibold text-white">Kata</span>
          </div>

          <p className="text-sm text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} Kata. Para amantes de los medios.
          </p>
        </div>
      </footer>
    </div>
  );
}
