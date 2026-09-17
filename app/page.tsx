'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, Zap, Search, ArrowRight, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardPreviewCard } from '@/components/ui/DashboardPreviewCard';
import { api } from '@/lib/api';
import { translations, Language } from '@/lib/i18n';

export default function HomePage() {
  const [lang, setLang] = useState<Language>('ru');
  const [universities, setUniversities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(currentLang);

    const onLangChange = () => {
      setLang((localStorage.getItem('app_lang') as Language) || 'ru');
    };
    window.addEventListener('languageChange', onLangChange);

    api.getUniversities()
      .then(data => {
        setUniversities(data || []);
      })
      .catch(err => {
        console.error('Failed to load universities', err);
        setUniversities([
          {
            id: 'kstu-demo',
            code: 'kstu',
            name: 'Кыргызский государственный технический университет им. И. Раззакова',
            name_ky: 'И. Раззаков атындагы Кыргыз мамлекеттик техникалык университети',
            is_active: true
          },
          {
            id: 'auca-demo',
            code: 'auca',
            name: 'Американский университет в Центральной Азии',
            name_ky: 'Борбордук Азиядагы Америка Университети',
            is_active: true
          }
        ]);
      })
      .finally(() => setIsLoading(false));

    return () => window.removeEventListener('languageChange', onLangChange);
  }, []);

  const t = translations[lang];

  const filteredUnis = universities.filter(u => {
    const q = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) ||
           u.name_ky?.toLowerCase().includes(q) ||
           u.code?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--body)]">
      {/* 1. Hero Section */}
      <section className="relative border-b border-[var(--line)] pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-7">
              {/* Eyebrow Badge */}
              <div className="mb-5">
                <Badge variant="blue" dot={true}>
                  {lang === 'ru' ? 'ПРОТОКОЛ ТАЙНОГО ГОЛОСОВАНИЯ 5.0' : 'ЖАШЫРУУН ШАЙЛОО ТУТУМУ 5.0'}
                </Badge>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-[800] text-[var(--ink)] tracking-[-0.03em] leading-[1.15] mb-6">
                {lang === 'ru' ? (
                  <>
                    Студенческие выборы <br />
                    <span className="text-[var(--blue)]">
                      прозрачно и анонимно
                    </span>
                  </>
                ) : (
                  <>
                    Студенттик шайлоо <br />
                    <span className="text-[var(--blue)]">
                      ачык жана жашыруун
                    </span>
                  </>
                )}
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-[17px] text-[var(--muted)] leading-relaxed mb-8 max-w-xl">
                {lang === 'ru'
                  ? 'Архитектурное физическое разделение реестра участия избирателей и содержимого бюллетеней на уровне базы данных. Деанонимизация невозможна даже при прямом доступе к серверам.'
                  : 'Шайлоочулардын катышуу тизмеси жана бюллетендер архитектуралык деңгээлде бири-биринен бөлүнүп сакталат. Серверге толук мүмкүнчүлүк болсо да шайлоочуну аныктоо мүмкүн эмес.'
                }
              </p>

              {/* Dual Action CTAs: 46px royal blue button + secondary */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <a href="#universities">
                  <Button variant="primary" size="md">
                    {lang === 'ru' ? 'Выбрать университет' : 'Университетти тандоо'}
                  </Button>
                </a>
                <Link href="/admin/login">
                  <Button variant="secondary" size="md">
                    {lang === 'ru' ? 'Панель комиссии' : 'Комиссия панели'}
                  </Button>
                </Link>
              </div>

              {/* Trust Signal */}
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--muted)]">
                <div className="flex text-[var(--blue)]">
                  {'★★★★★'}
                </div>
                <span>Математическая гарантия тайны голоса (Zero Correlation)</span>
              </div>
            </div>

            {/* Right Column: Floating Product Preview Card */}
            <div className="lg:col-span-5">
              <DashboardPreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three-Column Stat Block */}
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="crm-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-[var(--blue)]" />
                <span className="text-[12px] uppercase tracking-wider text-[var(--muted)] font-bold">ТАЙНА БЮЛЛЕТЕНЯ</span>
              </div>
              <div className="text-3xl sm:text-4xl font-[800] text-[var(--ink)] tracking-tight mb-1">
                100%
              </div>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
                Физическое разделение таблиц <code className="font-mono text-[var(--blue)]">VoteRecord</code> и <code className="font-mono text-[var(--blue)]">Ballot</code> исключает корреляционные атаки
              </p>
            </div>

            <div className="crm-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-[var(--blue)]" />
                <span className="text-[12px] uppercase tracking-wider text-[var(--muted)] font-bold">СКОРОСТЬ ВЕРИФИКАЦИИ</span>
              </div>
              <div className="text-3xl sm:text-4xl font-[800] text-[var(--ink)] tracking-tight mb-1">
                &lt; 1 СЕК
              </div>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
                Доставка одноразового 6-значного OTP-кода через защищенный SMS-шлюз
              </p>
            </div>

            <div className="crm-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-[var(--blue)]" />
                <span className="text-[12px] uppercase tracking-wider text-[var(--muted)] font-bold">ЗАЩИТА ОТ ДУБЛЕЙ</span>
              </div>
              <div className="text-3xl sm:text-4xl font-[800] text-[var(--ink)] tracking-tight mb-1">
                0 КОНФЛИКТОВ
              </div>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
                Атомарная блокировка row-level lock <code className="font-mono text-[var(--blue)]">select_for_update</code> при параллельных запросах
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. University Directory Section */}
      <section id="universities" className="py-16 md:py-24 border-b border-[var(--line)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="max-w-xl mx-auto text-center mb-10">
            <span className="text-[12px] uppercase tracking-wider text-[var(--muted)] block mb-2 font-bold">
              {lang === 'ru' ? 'РЕЕСТР УНИВЕРСИТЕТОВ' : 'УНИВЕРСИТЕТТЕР ТИЗМЕСИ'}
            </span>
            <h2 className="text-[28px] sm:text-[34px] font-[800] text-[var(--ink)] tracking-tight mb-2">
              {t.select_university}
            </h2>
            <p className="text-[15px] text-[var(--muted)]">
              {lang === 'ru'
                ? 'Выберите учебное заведение для перехода на страницу авторизации студента'
                : 'Студент катары кирүү үчүн окуу жайыңызды тандаңыз'
              }
            </p>
          </div>

          {/* Search Input: 48px height, 12px radius */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.search_uni_placeholder}
                className="crm-input pl-10"
              />
            </div>
          </div>

          {/* University Cards Grid: 16px radius */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {filteredUnis.map(uni => (
              <div
                key={uni.id || uni.code}
                className="crm-card p-6 flex flex-col justify-between hover:border-[var(--blue)]/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="blue">
                      {uni.code.toUpperCase()}
                    </Badge>
                    <Badge variant={uni.is_active ? 'green' : 'gray'} dot={uni.is_active}>
                      {uni.is_active ? 'АКТИВЕН' : 'НЕАКТИВЕН'}
                    </Badge>
                  </div>

                  <h3 className="text-[18px] font-bold text-[var(--ink)] mb-2 leading-snug">
                    {lang === 'ky' && uni.name_ky ? uni.name_ky : uni.name}
                  </h3>
                  <p className="text-[13.5px] text-[var(--muted)] mb-6">
                    {lang === 'ru'
                      ? 'Прямое электронное тайное голосование студентов и избирательной комиссии.'
                      : 'Студенттердин жана шайлоо комиссиясынын түз электрондук жашыруун добуш берүүсү.'
                    }
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
                  <span className="text-[13px] font-mono text-[var(--muted)]">
                    /vote/{uni.code}
                  </span>
                  <Link href={`/vote/auth?university=${uni.id}`}>
                    <Button variant="primary" size="sm" className="gap-1.5">
                      <span>{lang === 'ru' ? 'Войти' : 'Кирүү'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Architectural Verification Section */}
      <section className="py-16 bg-[var(--surface-2)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Technical Rationale */}
            <div>
              <span className="text-[12px] uppercase tracking-wider text-[var(--muted)] block mb-2 font-bold">
                АРХИТЕКТУРНАЯ СПЕЦИФИКАЦИЯ // РАЗДЕЛ 5
              </span>
              <h2 className="text-[28px] sm:text-[32px] font-[800] text-[var(--ink)] tracking-tight mb-4">
                Математическая гарантия тайны волеизъявления
              </h2>
              <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-6">
                В большинстве систем тайна декларируется лишь программно. В нашей системе студент и его голос
                физически разделены: таблица анонимных бюллетеней <code className="text-[var(--ink)] bg-[var(--surface)] px-2 py-0.5 rounded-[6px] border border-[var(--line)] font-mono">Ballot</code> не имеет внешнего ключа (<code className="text-[var(--ink)] bg-[var(--surface)] px-2 py-0.5 rounded-[6px] border border-[var(--line)] font-mono">student_id</code>) на реестр участия <code className="text-[var(--ink)] bg-[var(--surface)] px-2 py-0.5 rounded-[6px] border border-[var(--line)] font-mono">VoteRecord</code>.
              </p>
              <div className="flex items-center gap-3">
                <a href="#universities">
                  <Button variant="secondary" size="md">
                    Протестировать голосование
                  </Button>
                </a>
              </div>
            </div>

            {/* Right: Technical Code Proof Box in Surface */}
            <div className="crm-card p-6 font-mono text-[13px] text-[var(--ink)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--line)] text-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--blue)]" />
                  <span>secret_ballot_transaction.py</span>
                </div>
                <span className="text-[11px] text-[var(--blue)] font-sans font-bold">TRANSACTION.ATOMIC</span>
              </div>

              <div className="space-y-3 text-[12px] leading-relaxed">
                <div className="text-[var(--muted-2)]"># 1. Запись факта участия (БЕЗ кандидата)</div>
                <div className="text-[var(--ink)] font-mono bg-[var(--surface-2)] p-2.5 rounded-[8px]">
                  VoteRecord.objects.create(election=election, student=student, voted_at=now())
                </div>

                <div className="text-[var(--muted-2)] pt-1"># 2. Анонимный бюллетень (БЕЗ ссылки на студента!)</div>
                <div className="text-[var(--ink)] font-mono bg-[var(--surface-2)] p-2.5 rounded-[8px]">
                  Ballot.objects.create(election=election, candidate=candidate, cast_at=now())
                </div>

                <div className="pt-3 text-[var(--blue)] flex items-center gap-2 border-t border-[var(--line)] font-bold">
                  <span>✓</span>
                  <span>В таблице Ballot внешний ключ student_id физически отсутствует</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
