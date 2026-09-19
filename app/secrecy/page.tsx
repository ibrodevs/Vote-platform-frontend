'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Clock, ShieldCheck, Database, Split } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { Language } from '@/lib/i18n';

export default function SecrecyPage() {
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

    api.getStaticPage('secrecy')
      .then(data => {
        if (data) setPageData(data);
      })
      .catch(err => {
        console.warn('Could not load secrecy document from API, using fallback:', err);
      })
      .finally(() => setIsLoading(false));

    return () => {
      window.removeEventListener('languageChange', handleLangChange);
    };
  }, []);

  const title = lang === 'ky' && pageData?.title_ky ? pageData.title_ky : (pageData?.title || (lang === 'ky' ? 'Добуш берүүнүн купуялуулугу жана анонимдүүлүк архитектурасы' : 'Тайна волеизъявления и архитектура анонимности'));
  const rawContent = lang === 'ky' && pageData?.content_ky ? pageData.content_ky : (pageData?.content || '');

  const renderContent = (text: string) => {
    if (!text) {
      return (
        <div className="space-y-6 text-[15px] leading-relaxed text-[var(--body)]">
          <p>
            {lang === 'ru'
              ? 'Главным приоритетом платформы Dobush.kg является абсолютная защита тайны каждого отданного голоса. Архитектура системы исключает человеческий фактор.'
              : 'Dobush.kg платформасынын башкы приоритети — ар бир берилген добуштун купуялуулугун абсолюттук коргоо. Тутум адам факторун толук жокко чыгарат.'
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
            {lang === 'ru' ? 'КРИПТОГРАФИЧЕСКАЯ ЗАЩИТА' : 'КРИПТОГРАФИЯЛЫК КОРГОО'}
          </Badge>
        </div>

        {/* Document Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--blue)]">
              DOBUSH.KG // ANONYMITY-ARCHITECTURE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[800] text-[var(--ink)] tracking-tight mb-4 leading-[1.15]">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
              {lang === 'ru' ? 'Спецификация Zero-Trust 5.0' : 'Zero-Trust 5.0 спецификациясы'}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--green)]" />
              {lang === 'ru' ? 'Абсолютная анонимность гарантирована математически' : 'Абсолюттук жашыруундуулукка математикалык кепилдик'}
            </span>
          </div>
        </div>

        {/* Architecture Callout Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--ink)] mb-1">
                {lang === 'ru' ? 'Разделение баз данных' : 'Маалымат базаларын бөлүү'}
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {lang === 'ru'
                  ? 'Таблица явки студентов и таблица запечатанных бюллетеней физически разнесены.'
                  : 'Студенттердин катышуу таблицасы жана бекитилген бюллетендер таблицасы толук бөлүнгөн.'
                }
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--ink)] mb-1">
                {lang === 'ru' ? 'Разрыв связи (Zero Link)' : 'Байланышты үзүү (Zero Link)'}
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {lang === 'ru'
                  ? 'Никакие внешние ключи, IP или cookie не связывают студента с его бюллетенем.'
                  : 'Эч кандай тышкы ачкычтар, IP же cookie студентти анын бюллетени менен байланыштырбайт.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Document Body */}
        <div className="crm-card p-6 sm:p-10 md:p-12 shadow-[var(--shadow-card)]">
          {isLoading ? (
            <div className="py-12 text-center text-[var(--muted)] text-sm">
              {lang === 'ru' ? 'Загрузка спецификации...' : 'Спецификация жүктөлүүдө...'}
            </div>
          ) : (
            renderContent(rawContent)
          )}
        </div>
      </div>
    </div>
  );
}
