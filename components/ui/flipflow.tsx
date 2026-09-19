'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface CardData {
  name: string;
  nameKy?: string;
  backName?: string;
  badge?: string;
  badgeKy?: string;
  desc?: string;
  descKy?: string;
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
  repeat = 4,
  pauseOnHover = true,
  reverse = false,
  className,
  applyMask = true,
  ...props
}: FlowProps) => (
  <div
    {...props}
    className={cn(
      'group relative flex h-full w-full overflow-hidden p-1.5 [--duration:32s] [--gap:14px] gap-[var(--gap,14px)]',
      vertical ? 'flex-col' : 'flex-row',
      className,
    )}
  >
    {Array.from({ length: repeat }).map((_, index) => (
      <div
        key={`item-${index}`}
        className={cn('flex shrink-0 gap-[var(--gap,14px)]', {
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
      className={cn('h-24 w-60 shrink-0 cursor-pointer select-none', className)}
      onMouseEnter={() => setFlip(true)}
      onMouseLeave={() => setFlip(false)}
      onClick={() => setFlip(prev => !prev)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateX: flip ? 180 : 0 }}
        transition={{ duration: 0.55, type: 'spring', stiffness: 120, damping: 15 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-md"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className={cn(
              'h-full w-full border-2 border-white/20 rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all',
              colorClass,
            )}
          >
            {card.badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/25 text-white/95 mb-1 border border-white/10">
                {lang === 'ky' && card.badgeKy ? card.badgeKy : card.badge}
              </span>
            )}
            <span
              className="text-white font-black text-lg sm:text-xl uppercase tracking-tight drop-shadow truncate max-w-full"
            >
              {frontTitle}
            </span>
            {card.desc && (
              <span className="text-[11px] text-white/85 font-medium mt-0.5 truncate max-w-full">
                {lang === 'ky' && card.descKy ? card.descKy : card.desc}
              </span>
            )}
          </div>
        </motion.div>

        {/* Back Face */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-md"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}
        >
          <div
            className={cn(
              'h-full w-full border-2 border-white/20 rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all',
              backColorClass,
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white mb-1">
              {lang === 'ky' ? 'КУПУЯ ЖАНА КОРГОЛГОН' : 'ДОКАЗУЕМАЯ НАДЕЖНОСТЬ'}
            </span>
            <span
              className="text-white font-black text-lg sm:text-xl uppercase tracking-tight drop-shadow truncate max-w-full"
            >
              {backTitle}
            </span>
            <span className="text-[11px] text-white/90 font-medium mt-0.5 truncate max-w-full">
              {lang === 'ky' ? 'Dobush.kg платформасы' : 'Платформа Dobush.kg'}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const defaultVotingCards: CardData[] = [
  {
    name: 'ТАЙНА ГОЛОСОВАНИЯ',
    nameKy: 'КУПУЯ ДОБУШ',
    badge: 'КОНСТИТУЦИЯ КР',
    badgeKy: 'КР КОНСТИТУЦИЯСЫ',
    desc: '100% анонимность бюллетеня',
    descKy: '100% анонимдүү бюллетень',
  },
  {
    name: 'ШИФРОВАНИЕ 256-BIT',
    nameKy: '256-BIT ШИФРЛӨӨ',
    badge: 'БЕЗОПАСНОСТЬ',
    badgeKy: 'КООПСУЗДУК',
    desc: 'Криптографическая защита',
    descKy: 'Криптографиялык коргоо',
  },
  {
    name: 'ОНЛАЙН ВЫБОРЫ',
    nameKy: 'ОНЛАЙН ШАЙЛОО',
    badge: 'ПЛАТФОРМА',
    badgeKy: 'ПЛАТФОРМА',
    desc: 'Голосуй из любой точки',
    descKy: 'Каалаган жерден добуш бер',
  },
  {
    name: 'ВУЗЫ КЫРГЫЗСТАНА',
    nameKy: 'КР ЖОЖДОРУ',
    badge: 'ЭКОСИСТЕМА',
    badgeKy: 'ЭКОСИСТЕМА',
    desc: 'Единый студенческий реестр',
    descKy: 'Бирдиктүү студенттик реестр',
  },
  {
    name: 'БЕЗ ВБРОСОВ',
    nameKy: 'БУРМАЛООСУЗ',
    badge: 'ГАРАНТИЯ',
    badgeKy: 'КЕПИЛДИК',
    desc: 'Исключен человеческий фактор',
    descKy: 'Адамдык фактор жок',
  },
  {
    name: 'ПРОЗРАЧНЫЙ ПОДСЧЕТ',
    nameKy: 'АЧЫК-АЙКЫН ЭСЕП',
    badge: 'РЕЗУЛЬТАТ',
    badgeKy: 'ЖЫЙЫНТЫК',
    desc: 'Мгновенный протокол',
    descKy: 'Ыкчам протокол',
  },
  {
    name: 'ГОЛОС В 1 КЛИК',
    nameKy: '1 БАСУУ МЕНЕН',
    badge: 'УДОБСТВО',
    badgeKy: 'ЫҢГАЙЛУУЛУК',
    desc: 'Быстро и надежно',
    descKy: 'Тез жана ишенимдүү',
  },
  {
    name: 'DOBUSH.KG',
    nameKy: 'ДОБУШ.KG',
    badge: 'ТЕЛЕМЕТРИЯ 5.0',
    badgeKy: 'ТЕЛЕМЕТРИЯ 5.0',
    desc: 'Национальный стандарт',
    descKy: 'Улуттук стандарт',
  },
  {
    name: 'СТУДЕНТТЕР ҮЧҮН',
    nameKy: 'ДЛЯ СТУДЕНТОВ',
    badge: 'МОЛОДЕЖЬ',
    badgeKy: 'ЖАШТАР',
    desc: 'Твой выбор имеет значение',
    descKy: 'Сенин тандооң маанилүү',
  },
];

export function FlipFlow({
  data = defaultVotingCards,
  className,
  cardClassName,
  colors = [
    'bg-gradient-to-br from-blue-600 to-indigo-700',
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-emerald-600 to-teal-700',
    'bg-gradient-to-br from-sky-500 to-blue-600',
    'bg-gradient-to-br from-rose-500 to-red-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
  ],
  backColors = [
    'bg-gradient-to-br from-indigo-700 to-blue-800',
    'bg-gradient-to-br from-purple-600 to-indigo-800',
    'bg-gradient-to-br from-teal-700 to-emerald-800',
    'bg-gradient-to-br from-blue-600 to-sky-700',
    'bg-gradient-to-br from-red-600 to-rose-700',
    'bg-gradient-to-br from-orange-600 to-amber-700',
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
    <div className={cn('w-full overflow-hidden space-y-3.5', className)}>
      {[false, true, false].map((reverse, index) => (
        <Flow
          key={`flow-${index}`}
          reverse={reverse}
          className="[--duration:28s]"
          pauseOnHover
          applyMask
          repeat={8}
        >
          {data.map((card, j) => (
            <Card
              key={`${card.name}-${j}-${index}`}
              card={card}
              className={cardClassName}
              colorClass={colors[(j + index * 2) % colors.length]}
              backColorClass={backColors[(j + index * 2) % backColors.length]}
              lang={lang}
            />
          ))}
        </Flow>
      ))}
    </div>
  );
}
