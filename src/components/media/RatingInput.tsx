'use client';
import { NativeSelect } from '@/components/ui/Field';

import { useId } from 'react';
import { Star } from 'lucide-react';
interface RatingInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}
export function RatingInput({ value, onChange, max = 5, readonly = false }: RatingInputProps) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Star size={20} aria-hidden="true" className="text-amber-400" />
      {readonly ? (
        <span>{value === null ? 'Sin puntuar' : `${value}/${max}`}</span>
      ) : (
        <>
          <label htmlFor={id} className="kata-label sr-only">
            Valoración de 0 a {max}
          </label>
          <NativeSelect
            id={id}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            className="w-auto"
          >
            <option value="">Sin puntuar</option>
            {Array.from({ length: max * 2 + 1 }, (_, i) => i / 2).map((rating) => (
              <option key={rating} value={rating}>
                {rating.toLocaleString('es-ES')} / {max}
              </option>
            ))}
          </NativeSelect>
        </>
      )}
    </div>
  );
}
