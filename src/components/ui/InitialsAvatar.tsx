'use client';

import { useState } from 'react';
import { getInitials } from '@/lib/utils';

interface Props {
  name: string;
  email?: string | null;
  rank?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[10px] sm:text-xs',
  md: 'w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 text-xs sm:text-sm',
  lg: 'w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 text-sm sm:text-base md:text-xl',
};

export default function InitialsAvatar({
  name,
  email,
  rank,
  size = 'md',
}: Props) {
  const [loaded, setLoaded] = useState(false);

  const isOne = rank === 1;
  const isTwo = rank === 2;
  const isThree = rank === 3;
  const isTop = rank !== undefined && rank <= 3;

  const imageUrl = email
    ? `/api/avatar?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
    : null;

  // 🎨 Border logic (clean + premium)
  const borderClass = isOne
    ? 'border-2 border-fin-text'
    : isTwo
    ? 'border border-fin-border-strong'
    : isThree
    ? 'border border-fin-border-mid'
    : 'border border-fin-border';

  const textClass = isOne
    ? 'text-fin-text'
    : isTop
    ? 'text-fin-muted'
    : 'text-fin-faint';

  return (
    <div
      className={`
        ${sizeClasses[size]}
        relative
        rounded-full
        overflow-hidden
        flex items-center justify-center
        font-bold tracking-tight flex-shrink-0
        bg-white
        ${borderClass}
        shadow-[0_2px_8px_rgba(0,0,0,0.04)]
      `}
    >
      {/* Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          className={`
            absolute inset-0 h-full w-full object-cover
            transition-all duration-500 ease-out
            ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
          `}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* Initials fallback */}
      <span
        className={`
          relative z-10
          transition-opacity duration-300
          ${loaded ? 'opacity-0' : 'opacity-100'}
          ${textClass}
        `}
      >
        {getInitials(name)}
      </span>
    </div>
  );
}