'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from './Button';

export interface StarRatingProps {
  value: number | null;
  onChange: (value: number | null) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
}: StarRatingProps) {
  const [preview, setPreview] = useState<number | null>(null);
  const displayed = readonly ? (value ?? 0) : (preview ?? value ?? 0);
  const iconSize = { sm: 18, md: 24, lg: 28 }[size];
  const label = value === null ? 'Sin puntuar' : `${value.toLocaleString('es-ES')} / ${max}`;
  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-label={`Valoración de 0 a ${max}`}
        className="flex flex-wrap items-center gap-2"
      >
        {!readonly && (
          <Button
            size="sm"
            variant="ghost"
            aria-label="0 estrellas"
            aria-pressed={value === 0}
            onClick={() => onChange(0)}
          >
            0
          </Button>
        )}
        <div className="flex" onMouseLeave={() => setPreview(null)}>
          {Array.from({ length: max }, (_, i) => i + 1).map((rating) =>
            readonly ? (
              <Star
                key={rating}
                size={iconSize}
                aria-hidden="true"
                className="kata-rating-icon"
                data-filled={rating <= displayed}
              />
            ) : (
              <Button
                key={rating}
                variant="rating"
                aria-label={`${rating} ${rating === 1 ? 'estrella' : 'estrellas'}`}
                aria-pressed={value === rating}
                onClick={() => onChange(rating)}
                onMouseEnter={() => setPreview(rating)}
                onFocus={() => setPreview(rating)}
                onBlur={() => setPreview(null)}
              >
                <Star
                  size={iconSize}
                  aria-hidden="true"
                  className="kata-rating-icon"
                  data-filled={rating <= displayed}
                />
              </Button>
            ),
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--text-secondary)]" aria-live="polite">
          {label}
        </span>
        {!readonly && value !== null && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setPreview(null);
              onChange(null);
            }}
          >
            Quitar puntuación
          </Button>
        )}
      </div>
    </div>
  );
}
