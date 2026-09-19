'use client';

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { FlipFlow, defaultVotingCards } from './flipflow';
import { Language } from '@/lib/i18n';

interface FlipFlowSectionProps {
  lang?: Language;
}

export function FlipFlowSection({ lang = 'ru' }: FlipFlowSectionProps) {
  const isKy = lang === 'ky';

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-[var(--bg)] border-y border-[var(--line)]/60">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[var(--blue)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--blue-soft)] text-[var(--blue-soft-text)] text-xs font-bold uppercase tracking-wider mb-4 border border-[var(--blue)]/15 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--blue)]" />
          <span>{isKy ? 'Платформанын кепилдиктери' : 'Гарантии платформы'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
          <span className="text-[11px] font-mono">ТЕЛЕМЕТРИЯ 5.0</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
          {isKy
            ? 'Коопсуздук. Купуялуулук. Ишеним.'
            : 'Безопасность. Тайна. Доверие.'}
        </h2>

        {/* Subtitle / Description */}
        <p className="mt-3 text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
          {isKy
            ? 'Ар бир добуш аягына чейин шифрлөө жана маалымат базаларын декуплингдөө протоколу менен корголгон. Картаны оодарып көрүү үчүн үстүнө басыңыз же кармаңыз.'
            : 'Каждый голос защищен сквозным шифрованием и аппаратной изоляцией протокола. Наведите на карточку, чтобы перевернуть.'}
        </p>
      </div>

      {/* Looping FlipFlow Cards */}
      <div className="relative z-10">
        <FlipFlow data={defaultVotingCards} lang={lang} />
      </div>
    </section>
  );
}
