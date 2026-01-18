'use client';

import { useEffect, useRef, useState } from 'react';

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ children, className = '', delay = 0 }: TextRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const chars = charsRef.current;
    chars.forEach((char, index) => {
      setTimeout(() => {
        char.style.opacity = '1';
        char.style.transform = 'translateY(0) rotate(0deg)';
      }, delay + index * 30);
    });
  }, [isVisible, delay]);

  const splitText = (text: string) => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        ref={(el) => { if (el) charsRef.current[i] = el; }}
        className="inline-block transition-all duration-700 ease-out"
        style={{
          opacity: '0',
          transform: 'translateY(40px) rotate(10deg)',
          transitionDelay: `${i * 20}ms`,
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <span ref={containerRef} className={className}>
      {splitText(children)}
    </span>
  );
}
