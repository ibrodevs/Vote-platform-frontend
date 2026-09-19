'use client';

import React from 'react';
import { FlipFlow, defaultVotingCards } from './flipflow';
import { Language } from '@/lib/i18n';

interface FlipFlowSectionProps {
  lang?: Language;
}

export function FlipFlowSection({ lang = 'ru' }: FlipFlowSectionProps) {
  return (
    <section className="relative py-4 sm:py-6 overflow-hidden bg-[var(--bg)] border-y border-[var(--line)]">
      <div className="relative z-10 w-full">
        <FlipFlow data={defaultVotingCards} lang={lang} />
      </div>
    </section>
  );
}
