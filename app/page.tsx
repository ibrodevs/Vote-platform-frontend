'use client';

import React, { useState, useEffect } from 'react';
import { HeroSectionwithCards } from '@/components/ui/HeroSectionwithCards';
import { FlipFlowSection } from '@/components/ui/FlipFlowSection';
import { RecentElections } from '@/components/ui/RecentElections';
import { RecentNews } from '@/components/ui/RecentNews';
import { FrequentlyAskedQuestions } from '@/components/ui/FrequentlyAskedQuestions';
import { Language } from '@/lib/i18n';

export default function HomePage() {
  const [lang, setLang] = useState<Language>('ru');

  useEffect(() => {
    const currentLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(currentLang);

    const onLangChange = () => {
      setLang((localStorage.getItem('app_lang') as Language) || 'ru');
    };
    window.addEventListener('languageChange', onLangChange);
    return () => window.removeEventListener('languageChange', onLangChange);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--body)]">
      {/* 1. Hero Section with Globe */}
      <HeroSectionwithCards lang={lang} />

      {/* 2. Interactive Looping FlipFlow of Voting Guarantees & Values */}
      <FlipFlowSection lang={lang} />

      {/* 3. Recent Elections with Depth Card */}
      <RecentElections lang={lang} />

      {/* 4. Recent News with Depth Card */}
      <RecentNews lang={lang} />

      {/* 5. Frequently Asked Questions (FAQ) */}
      <FrequentlyAskedQuestions lang={lang} />
    </div>
  );
}
