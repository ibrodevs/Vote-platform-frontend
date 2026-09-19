'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface CardData {
  name: string;
  nameKy?: string;
  backName?: string;
}

interface FlowProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
  repeat?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  applyMask?: boolean;
}

const Flow = ({
  children,
  vertical = false,
  repeat = 6,
  pauseOnHover = true,
  reverse = false,
  className,
  applyMask = true,
  ...props
}: FlowProps) => (
  <div
    {...props}
    className={cn(
      'group relative flex h-full w-full overflow-hidden py-1 [--duration:28s] [--gap:10px] sm:[--gap:14px] gap-[var(--gap,10px)]',
      vertical ? 'flex-col' : 'flex-row',
      className,
    )}
  >
    {Array.from({ length: repeat }).map((_, index) => (
      <div
        key={`item-${index}`}
        className={cn('flex shrink-0 gap-[var(--gap,10px)] sm:gap-[var(--gap,14px)]', {
          'group-hover:paused': pauseOnHover,
          'direction-reverse': reverse,
          'animate-canopy-horizontal flex-row': !vertical,
          'animate-canopy-vertical flex-col': vertical,
        })}
      >
        {children}
      </div>
    ))}
    {applyMask && (
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-10 h-full w-full',
          vertical
            ? 'bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)]'
            : 'bg-gradient-to-r from-[var(--bg)] via-transparent to-[var(--bg)]',
        )}
      />
    )}
  </div>
);

const Card = ({
  card,
  className,
  colorClass,
  backColorClass,
  lang = 'ru',
}: {
  card: CardData;
  className?: string;
  colorClass: string;
  backColorClass: string;
  lang?: 'ru' | 'ky';
}) => {
  const [flip, setFlip] = useState(false);

  const frontTitle = lang === 'ky' && card.nameKy ? card.nameKy : card.name;
  const backTitle = card.backName || (card.nameKy && lang === 'ru' ? card.nameKy : card.name);

  return (
    <div
      className={cn('h-14 sm:h-18 w-36 sm:w-48 shrink-0 cursor-pointer select-none', className)}
      onMouseEnter={() => setFlip(true)}
      onMouseLeave={() => setFlip(false)}
      onClick={() => setFlip(prev => !prev)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateX: flip ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120, damping: 15 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <motion.div
          className="absolute inset-0 rounded-[14px] sm:rounded-[16px] overflow-hidden shadow-xs"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className={cn(
              'h-full w-full rounded-[14px] sm:rounded-[16px] flex items-center justify-center px-3 text-center transition-all',
              colorClass,
            )}
          >
            <span className="font-extrabold text-[13px] sm:text-base uppercase tracking-wide truncate max-w-full">
              {frontTitle}
            </span>
          </div>
        </motion.div>

        {/* Back Face */}
        <motion.div
          className="absolute inset-0 rounded-[14px] sm:rounded-[16px] overflow-hidden shadow-xs"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}
        >
          <div
            className={cn(
              'h-full w-full rounded-[14px] sm:rounded-[16px] flex items-center justify-center px-3 text-center transition-all',
              backColorClass,
            )}
          >
            <span className="font-extrabold text-[13px] sm:text-base uppercase tracking-wide truncate max-w-full">
              {backTitle}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const defaultVotingCards: CardData[] = [
  { name: 'ГОЛОС', nameKy: 'ДОБУШ' },
  { name: 'ТАЙНА', nameKy: 'КУПУЯ' },
  { name: 'ВЫБОР', nameKy: 'ТАНДОО' },
  { name: 'ЗАЩИТА', nameKy: 'КОРГОО' },
  { name: 'ЧЕСТНО', nameKy: 'КАЛЫС' },
  { name: 'ОНЛАЙН', nameKy: 'ОНЛАЙН' },
  { name: 'ВУЗЫ', nameKy: 'ЖОЖДОР' },
  { name: 'БЫСТРО', nameKy: 'ЫКЧАМ' },
  { name: 'СТУДЕНТ', nameKy: 'СТУДЕНТ' },
  { name: 'DOBUSH', nameKy: 'ДОБУШ' },
  { name: 'НАДЕЖНО', nameKy: 'ИШЕНИМДҮҮ' },
  { name: 'ЕДИНСТВО', nameKy: 'БИРДИК' },
];

export function FlipFlow({
  data = defaultVotingCards,
  className,
  cardClassName,
  colors = [
    'bg-[var(--blue)] text-white border border-[var(--blue-hover)]',
    'bg-[var(--surface)] text-[var(--blue)] border border-[var(--line-strong)] dark:border-[var(--line)] shadow-xs',
    'bg-[var(--blue-soft)] text-[var(--blue-soft-text)] border border-[var(--blue)]/20',
    'bg-[var(--surface)] text-[var(--ink)] border border-[var(--blue)]/30 shadow-xs',
    'bg-gradient-to-r from-[var(--blue)] to-[var(--indigo)] text-white border border-[var(--blue)]',
    'bg-[var(--surface-2)] text-[var(--blue)] border border-[var(--line-strong)]',
  ],
  backColors = [
    'bg-[var(--surface)] text-[var(--blue)] border border-[var(--line-strong)] shadow-xs',
    'bg-[var(--blue)] text-white border border-[var(--blue-hover)]',
    'bg-gradient-to-r from-[var(--blue)] to-[var(--indigo)] text-white border border-[var(--blue)]',
    'bg-[var(--blue-soft)] text-[var(--blue-soft-text)] border border-[var(--blue)]/20',
    'bg-[var(--surface)] text-[var(--blue)] border border-[var(--blue)]/30',
    'bg-[var(--blue)] text-white border border-[var(--blue)]',
  ],
  lang = 'ru',
}: {
  data?: CardData[];
  className?: string;
  cardClassName?: string;
  colors?: string[];
  backColors?: string[];
  lang?: 'ru' | 'ky';
}) {
  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <Flow
        className="[--duration:28s]"
        pauseOnHover
        applyMask
        repeat={6}
      >
        {data.map((card, j) => (
          <Card
            key={`${card.name}-${j}`}
            card={card}
            className={cardClassName}
            colorClass={colors[j % colors.length]}
            backColorClass={backColors[j % backColors.length]}
            lang={lang}
          />
        ))}
      </Flow>
    </div>
  );
}
