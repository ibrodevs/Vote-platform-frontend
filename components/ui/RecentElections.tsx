'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, ChevronRight } from 'lucide-react';
import { DepthCard } from '@/components/ui/depth-card';
import { Badge } from '@/components/ui/Badge';
import { api, getMediaUrl } from '@/lib/api';
import { Language } from '@/lib/i18n';

interface ElectionItem {
  id: string;
  title: string;
  title_ky?: string;
  description?: string;
  university_name?: string;
  university_code?: string;
  status: 'active' | 'upcoming' | 'completed';
  candidates_count?: number;
  voters_count?: number;
  start_date?: string;
  end_date?: string;
  image?: string;
}

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd?q=80&w=800&auto=format&fit=crop',
];

const FALLBACK_ELECTIONS: ElectionItem[] = [
  {
    id: '1',
    title: 'Выборы председателя Студенческого совета КНУ',
    title_ky: 'ЖУУнун Студенттик кеңешинин төрагасын шайлоо',
    description: 'Главные студенческие выборы года. Определение лидера студенческого самоуправления университета.',
    university_name: 'Кыргызский Национальный Университет',
    university_code: 'knu',
    status: 'active',
    candidates_count: 4,
    start_date: '15 Сен',
    end_date: '25 Сен',
    image: COVER_IMAGES[0],
  },
  {
    id: '2',
    title: 'Выборы студенческого декана ФИТиЭ КРСУ',
    title_ky: 'КРСУнун ФИТиЭ студенттик деканын шайлоо',
    description: 'Электронное голосование за представителей факультета информационных технологий и электроники.',
    university_name: 'Кыргызско-Российский Славянский Университет',
    university_code: 'krsu',
    status: 'active',
    candidates_count: 3,
    start_date: '18 Сен',
    end_date: '28 Сен',
    image: COVER_IMAGES[1],
  },
  {
    id: '3',
    title: 'Выборы в Молодёжный парламент КГТУ им. И. Раззакова',
    title_ky: 'И. Раззаков атындагы КМТУнун Жаштар парламентине шайлоо',
    description: 'Прямые тайные выборы делегатов молодежного парламента технических специальностей.',
    university_name: 'Кыргызский Государственный Технический Университет',
    university_code: 'kstu',
    status: 'active',
    candidates_count: 5,
    start_date: '20 Сен',
    end_date: '30 Сен',
    image: COVER_IMAGES[2],
  },
];

interface RecentElectionsProps {
  lang?: Language;
}

export function RecentElections({ lang = 'ru' }: RecentElectionsProps) {
  const [elections, setElections] = useState<ElectionItem[]>(FALLBACK_ELECTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getRecentElections()
      .then((data) => {
        const list = Array.isArray(data) ? data : ((data as any)?.results || []);
        if (isMounted && list.length > 0) {
          const mapped: ElectionItem[] = list.map((item: any, idx: number) => {
            const startDate = item.starts_at
              ? new Date(item.starts_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
              : '15 Сен';
            const endDate = item.ends_at
              ? new Date(item.ends_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
              : '25 Сен';

            const itemStatus: 'active' | 'upcoming' | 'completed' =
              item.status === 'active' || item.is_voting_open
                ? 'active'
                : item.status === 'finished'
                ? 'completed'
                : 'upcoming';

            return {
              id: item.id || String(idx + 1),
              title: item.title || 'Студенческие выборы',
              title_ky: item.title_ky,
              description:
                item.description ||
                (lang === 'ru'
                  ? 'Прямое тайное электронное волеизъявление студентов.'
                  : 'Студенттердин түз электрондук жашыруун добуш берүүсү.'),
              university_name:
                item.university_details?.name || item.university_name || 'Университет',
              university_code:
                item.university_details?.code || item.university_code || 'vote',
              status: itemStatus,
              candidates_count: item.candidates_count ?? 0,
              start_date: startDate,
              end_date: endDate,
              image: getMediaUrl(item.cover_image || item.cover_image_url) || COVER_IMAGES[idx % COVER_IMAGES.length],
            };
          });

          // Ensure 3 cards are always displayed
          if (mapped.length < 3) {
            const padded = [...mapped];
            for (let i = mapped.length; i < 3; i++) {
              padded.push(FALLBACK_ELECTIONS[i]);
            }
            setElections(padded);
          } else {
            setElections(mapped.slice(0, 3));
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load recent elections from backend, using preview:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lang]);

  const getStatusBadge = (status: 'active' | 'upcoming' | 'completed') => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {lang === 'ru' ? 'АКТИВНО' : 'АКТИВДҮҮ'}
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/30">
          {lang === 'ru' ? 'ЗАВЕРШЕНО' : 'АЯКТАДЫ'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30">
        {lang === 'ru' ? 'СКОРО' : 'ЖАЛЫНДУУ'}
      </span>
    );
  };

  return (
    <section className="relative py-10 sm:py-16 md:py-24 border-b border-[var(--line)] bg-[var(--surface)] transition-colors duration-500 overflow-hidden">
      <div className="relative z-10 max-w-[1280px] mx-auto px-3.5 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-7 sm:mb-12">
          <Badge variant="blue" className="mb-2.5 sm:mb-3 text-[11px] sm:text-xs">
            {lang === 'ru' ? 'АКТУАЛЬНЫЕ КАМПАНИИ' : 'АКТУАЛДУУ КАМПАНИЯЛАР'}
          </Badge>
          <h2 className="text-[24px] sm:text-[32px] md:text-[40px] font-[800] text-[var(--ink)] tracking-tight mb-2.5 sm:mb-3">
            {lang === 'ru' ? 'Последние выборы' : 'Акыркы шайлоолор'}
          </h2>
          <p className="text-[13.5px] sm:text-[15px] text-[var(--muted)] leading-relaxed px-1">
            {lang === 'ru'
              ? 'Интерактивный список избирательных процессов в вузах страны. Выберите кампанию для ознакомления и волеизъявления.'
              : 'Өлкөнүн жогорку окуу жайларындагы активдүү шайлоолордун тизмеси. Катышуу үчүн кампанияны тандаңыз.'}
          </p>
        </div>

        {/* 3 Depth Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {elections.map((election) => (
            <div key={election.id} className="h-[390px] sm:h-[430px] md:h-[440px] w-full">
              <DepthCard
                image={election.image}
                maxRotation={16}
                maxTranslation={18}
                borderRadius="20px"
                spotlight={true}
                disableOnMobile={true}
                spotlightColor="rgba(37, 102, 255, 0.35)"
                href={`/vote/auth?election=${election.id}`}
                className="border border-black/10 dark:border-white/10 shadow-xl"
                contentClassName="justify-between bg-gradient-to-t from-black/95 via-black/60 to-black/25 text-white"
              >
                {/* Top Card Elements */}
                <div className="flex items-center justify-between w-full">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md text-white border border-white/20">
                    {election.university_code?.toUpperCase() || 'VOTE'}
                  </span>
                  {getStatusBadge(election.status)}
                </div>

                {/* Bottom Card Elements */}
                <div className="space-y-2.5 sm:space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-md">
                    {lang === 'ky' && election.title_ky ? election.title_ky : election.title}
                  </h3>

                  <p className="text-[12px] sm:text-xs text-white/80 line-clamp-2 leading-relaxed">
                    {election.description}
                  </p>

                  <div className="pt-2.5 sm:pt-3 border-t border-white/15 flex items-center justify-between text-[11.5px] sm:text-xs text-white/90">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[var(--blue-soft)]" />
                      <span>{election.candidates_count} канд.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--blue-soft)]" />
                      <span>{election.start_date} – {election.end_date}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 sm:pt-2 flex items-center justify-between text-sm font-semibold text-[var(--blue-soft)] group-hover:text-white transition-colors">
                    <span>
                      {election.status === 'active'
                        ? lang === 'ru' ? 'Голосовать' : 'Добуш берүү'
                        : lang === 'ru' ? 'Подробнее' : 'Кененирээк'}
                    </span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </DepthCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecentElections;
