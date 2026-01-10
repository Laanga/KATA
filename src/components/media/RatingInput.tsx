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
  max = 10, 
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
  const filledStars = Math.floor(displayValue);
  const hasHalfStar = displayValue % 1 !== 0;

  const handleClick = (index: number) => {
    if (readonly) return;
    
    // Click on same star = half point
    if (value === index) {
      onChange(index - 0.5);
    } else {
      onChange(index);
    }
  };

  const handleMouseMove = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    
    setHoverValue(isHalf ? index - 0.5 : index);
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const index = i + 1;
        const isFilled = index <= filledStars;
        const isHalf = index === filledStars + 1 && hasHalfStar;

        return (
          <div
            key={index}
            className={cn(
              'relative cursor-pointer transition-transform',
              !readonly && 'hover:scale-110',
              sizeClasses[size]
            )}
            onClick={() => handleClick(index)}
            onMouseMove={(e) => handleMouseMove(index, e)}
            onMouseLeave={() => setHoverValue(null)}
          >
            <Star
              className={cn(
                'absolute inset-0 transition-all',
                isFilled ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'
              )}
              size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
            />
            {isHalf && (
              <Star
                className="absolute inset-0 fill-yellow-500 text-yellow-500"
                style={{ clipPath: 'inset(0 50% 0 0)' }}
                size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
              />
            )}
          </div>
        );
      })}
      <span className="ml-2 text-sm font-medium text-[var(--text-secondary)]">
        {value ? `${value.toFixed(1)}/10` : 'Not rated'}
      </span>
    </div>
  );
}
