'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Clock, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { Language } from '@/lib/i18n';

export default function PrivacyPolicyPage() {
  const [lang, setLang] = useState<Language>('ru');
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(savedLang);

    const handleLangChange = () => {
      const current = (localStorage.getItem('app_lang') as Language) || 'ru';
      setLang(current);
    };

    window.addEventListener('languageChange', handleLangChange);

    api.getStaticPage('privacy')
      .then(data => {
        if (data) setPageData(data);
      })
      .catch(err => {
        console.warn('Could not load privacy policy from API, using fallback:', err);
      })
      .finally(() => setIsLoading(false));

    return () => {
      window.removeEventListener('languageChange', handleLangChange);
    };
  }, []);

  const title = lang === 'ky' && pageData?.title_ky ? pageData.title_ky : (pageData?.title || (lang === 'ky' ? 'Жеке маалыматтарды коргоо жана купуялык саясаты' : 'Политика конфиденциальности и защиты персональных данных'));
  const rawContent = lang === 'ky' && pageData?.content_ky ? pageData.content_ky : (pageData?.content || '');

  const renderContent = (text: string) => {
    if (!text) {
      return (
        <div className="space-y-6 text-[15px] leading-relaxed text-[var(--body)]">
          <p>
            {lang === 'ru'
              ? 'Платформа Dobush.kg обрабатывает исключительно минимально необходимый объем персональных данных студентов для обеспечения честного студенческого голосования.'
              : 'Dobush.kg платформасы таза студенттик шайлоону камсыз кылуу үчүн студенттердин минималдуу жеке маалыматтарын гана иштетет.'
            }
          </p>
        </div>
      );
    }

    const paragraphs = text.split('\n\n');
    return (
      <div className="space-y-6">
        {paragraphs.map((p, idx) => {
          const trimmed = p.trim();
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-xl sm:text-2xl font-bold text-[var(--ink)] pt-4 pb-1 border-b border-[var(--line)]">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-lg font-bold text-[var(--ink)] pt-2">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          return (
            <p key={idx} className="text-[15px] sm:text-[16px] leading-relaxed text-[var(--body)]">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--body)] py-12 md:py-20">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Вернуться на главную' : 'Башкы бетке кайтуу'}</span>
          </Link>

          <Badge variant="blue" dot={true}>
            {lang === 'ru' ? 'ЗАЩИТА ДАННЫХ' : 'МААЛЫМАТТЫ КОРГОО'}
          </Badge>
        </div>

        {/* Document Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--blue)]">
              DOBUSH.KG // PRIVACY-POLICY
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[800] text-[var(--ink)] tracking-tight mb-4 leading-[1.15]">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
              {lang === 'ru' ? 'Актуально на 2026 год' : '2026-жылга карата актуалдуу'}
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[var(--green)]" />
              {lang === 'ru' ? 'Соответствие закону КР о защите персональных данных' : 'КР жеке маалыматты коргоо мыйзамына ылайыктуу'}
            </span>
          </div>
        </div>

        {/* Main Document Body */}
        <div className="crm-card p-6 sm:p-10 md:p-12 shadow-[var(--shadow-card)]">
          {isLoading ? (
            <div className="py-12 text-center text-[var(--muted)] text-sm">
              {lang === 'ru' ? 'Загрузка политики конфиденциальности...' : 'Купуялык саясаты жүктөлүүдө...'}
            </div>
          ) : (
            renderContent(rawContent)
          )}
        </div>
      </div>
    </div>
  );
}
