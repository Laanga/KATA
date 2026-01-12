'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RatingInputProps {
  value: number | null;
  onChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

export function RatingInput({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const displayValue = hoverValue ?? value ?? 0;

  const handleClick = (index: number) => {
    if (readonly) return;
    onChange(index);
  };

  const handleMouseEnter = (index: number) => {
    if (readonly) return;
    setHoverValue(index);
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const index = i + 1;
        const isFilled = index <= displayValue;

        return (
          <div
            key={index}
            className={cn(
              'relative cursor-pointer transition-transform',
              !readonly && 'hover:scale-110',
              sizeClasses[size]
            )}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => setHoverValue(null)}
          >
            <Star
              className={cn(
                'absolute inset-0 transition-all',
                isFilled ? 'fill-[var(--accent-warning)] text-[var(--accent-warning)]' : 'text-[var(--text-tertiary)]'
              )}
              size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
            />
          </div>
        );
      })}
      <span className="ml-2 text-sm font-medium text-[var(--text-secondary)]">
        {value ? `${value}/${max}` : 'Sin puntuar'}
      </span>
    </div>
  );
}
