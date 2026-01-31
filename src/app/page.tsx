'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import {
  BookOpen, Gamepad2, Film, Tv, ArrowRight, Sparkles,
  Search, Plus, Star, BarChart3, Check, Zap, Shield, Clock
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
          }
        )
        .fromTo(
          '.kanji-glow',
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 1 },
          '-=1'
        )
        .fromTo(
          '.hero-title',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(
          '.hero-subtitle',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          '.hero-cta',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.3'
        )
        .fromTo(
          '.scroll-indicator',
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          '-=0.2'
        );

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
          }
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
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.step-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          {
            x: i % 2 === 0 ? -100 : 100,
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
          }
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
          }
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
            }
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
          }
        );
      });

      gsap.fromTo(
        '.final-cta',
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.final-cta',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
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
      gradient: 'from-purple-500/20 to-purple-900/10',
    },
    {
      icon: Gamepad2,
      title: 'Juegos',
      description: 'Tu backlog de videojuegos bajo control. PC, consolas, móvil... todo en uno.',
      color: 'var(--color-game)',
      gradient: 'from-red-500/20 to-red-900/10',
    },
    {
      icon: Film,
      title: 'Películas',
      description: 'Organiza tu watchlist cinematográfica. Nunca olvides una recomendación.',
      color: 'var(--color-movie)',
      gradient: 'from-blue-500/20 to-blue-900/10',
    },
    {
      icon: Tv,
      title: 'Series',
      description: 'Rastrea cada temporada y episodio. Sabe exactamente dónde lo dejaste.',
      color: 'var(--color-series)',
      gradient: 'from-emerald-500/20 to-emerald-900/10',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Busca',
      description: 'Encuentra libros, juegos, películas y series usando nuestra búsqueda integrada con bases de datos globales.',
    },
    {
      number: '02',
      icon: Plus,
      title: 'Añade',
      description: 'Agrega cualquier título a tu biblioteca con un solo click. Elige su estado: quiero ver, viendo, completado...',
    },
    {
      number: '03',
      icon: Star,
      title: 'Valora',
      description: 'Puntúa y escribe reseñas para recordar qué te pareció cada obra. Tu opinión, tu historia.',
    },
    {
      number: '04',
      icon: BarChart3,
      title: 'Analiza',
      description: 'Visualiza estadísticas de tu consumo de medios. Descubre patrones y celebra tu progreso.',
    },
  ];

  const benefits = [
    { icon: Zap, text: 'Interfaz rápida y fluida' },
    { icon: Shield, text: 'Tus datos seguros en la nube' },
    { icon: Clock, text: 'Sincronización en tiempo real' },
    { icon: Sparkles, text: 'Diseño minimalista japonés' },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-black w-full max-w-full landing-container">
      <ParticleBackground />

      <div className="fixed inset-0 z-0">
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

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-emerald-400">型</span>
            <span className="text-lg font-bold text-white">Kata</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm bg-emerald-500 text-black font-medium rounded-full hover:bg-emerald-400 transition-all"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <div ref={kanjiContainerRef} className="relative mb-6">
          <div ref={kanjiRef} style={{ perspective: '1000px' }}>
            <div className="kanji-glow absolute inset-0 blur-3xl opacity-40">
              <div className="w-full h-full bg-gradient-to-br from-emerald-500/60 via-emerald-400/40 to-transparent rounded-full" />
            </div>

            <span
              className="relative block text-[clamp(120px,35vw,280px)] font-bold leading-none select-none"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 80px rgba(16, 185, 129, 0.4)',
                fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif',
              }}
            >
              型
            </span>

            <div className="absolute inset-0 -m-6 border border-emerald-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 -m-12 border border-emerald-500/10 rounded-full" />
          </div>
        </div>

        <div className="hero-title text-center mb-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter">
            <span className="text-white">Kata</span>
          </h1>
        </div>

        <div className="hero-subtitle text-center max-w-2xl mb-10 px-4">
          <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-3">
            Tu <span className="text-emerald-400 font-semibold">biblioteca personal</span> para organizar
            <br className="hidden sm:block" />
            libros, juegos, películas y series.
          </p>
          <p className="text-sm text-[var(--text-tertiary)] font-light">
            形 (kata) — La forma perfecta a través de la práctica
          </p>
        </div>

        <div className="hero-cta flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="group relative px-8 py-4 bg-emerald-500 text-black font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] text-center"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Comenzar Gratis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/login"
            className="group px-8 py-4 border border-white/20 text-white font-medium rounded-full transition-all duration-300 hover:bg-white/5 hover:border-white/40 text-center"
          >
            Ya tengo cuenta
          </Link>
        </div>

        <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-tertiary)]">
          <span className="text-xs uppercase tracking-widest">Descubre más</span>
          <div className="w-px h-8 bg-gradient-to-b from-emerald-500/50 to-transparent animate-pulse" />
        </div>
      </section>

      <section className="relative z-10 py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="section-header text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full mb-4">
              CARACTERÍSTICAS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Todo tu entretenimiento,<br />un solo lugar
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
              Organiza y rastrea todo lo que consumes. Sin complicaciones, con elegancia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`feature-card group relative p-8 rounded-3xl border border-white/5 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/20 hover:scale-[1.02]`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${feature.color}15 0%, transparent 70%)`,
                  }}
                />

                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon
                    size={28}
                    style={{ color: feature.color }}
                  />
                </div>

                <h3 className="relative text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="relative text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>

                <div
                  className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-30"
                  style={{ backgroundColor: feature.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="section-header text-center mb-20">
            <span className="inline-block px-4 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full mb-4">
              CÓMO FUNCIONA
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple como debe ser
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
              Cuatro pasos para organizar tu vida de entretenimiento.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`step-card relative flex items-start gap-8 p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                <div className="flex-shrink-0">
                  <span className="text-6xl md:text-8xl font-bold text-emerald-500/20">
                    {step.number}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <step.icon size={24} className="text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -bottom-8 left-1/2 w-px h-8 bg-gradient-to-b from-emerald-500/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-header mb-8">
                <span className="inline-block px-4 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full mb-4">
                  ¿POR QUÉ KATA?
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Diseñado para ti
                </h2>
                <p className="text-lg text-[var(--text-secondary)]">
                  Kata nace de la filosofía japonesa de la mejora continua.
                  Cada detalle está pensado para hacer tu experiencia simple y satisfactoria.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="benefit-item flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon size={20} className="text-emerald-400" />
                    </div>
                    <span className="text-white font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="feature-card relative">
              <div className="aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/20 to-black p-8 flex items-center justify-center overflow-hidden">
                <span
                  className="text-[200px] font-bold opacity-5 select-none absolute"
                  style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                >
                  型
                </span>

                <div className="relative w-full max-w-xs">
                  <div className="space-y-3">
                    {['Libro actual', 'Juego en progreso', 'Serie siguiendo'].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      >
                        <div
                          className="w-8 h-10 rounded bg-gradient-to-br from-white/20 to-white/5"
                        />
                        <div className="flex-1">
                          <div className="h-2 w-24 bg-white/20 rounded mb-1.5" />
                          <div className="h-1.5 w-16 bg-white/10 rounded" />
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

      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '4', label: 'Tipos de media', suffix: '' },
              { value: '∞', label: 'Items ilimitados', suffix: '' },
              { value: '100', label: 'Gratis', suffix: '%' },
              { value: '0', label: 'Anuncios', suffix: '' },
            ].map((stat, i) => (
              <div key={i} className="feature-card text-center p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">
                  {stat.value === '∞' ? (
                    <span>∞</span>
                  ) : (
                    <>
                      <span className="stat-number" data-value={stat.value}>{stat.value}</span>
                      {stat.suffix}
                    </>
                  )}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="final-cta relative p-12 md:p-20 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/30 via-emerald-900/10 to-black overflow-hidden text-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
              <span
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-bold opacity-[0.03] select-none"
                style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
              >
                型
              </span>
            </div>

            <div className="relative">
              <Sparkles className="w-12 h-12 mx-auto mb-6 text-emerald-400" />

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Empieza tu kata hoy
              </h2>

              <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl mx-auto">
                Únete a Kata y comienza a organizar tu biblioteca personal de medios.
                Gratis para siempre. Sin anuncios. Sin límites.
              </p>

              <Link
                href="/signup"
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
              >
                Crear cuenta gratis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <p className="mt-6 text-sm text-[var(--text-tertiary)]">
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
