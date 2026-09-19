'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Newspaper, ArrowRight } from 'lucide-react';
import { DepthCard } from '@/components/ui/depth-card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NEWS_ARTICLES } from '@/lib/newsData';
import { Language } from '@/lib/i18n';
import { api, getMediaUrl } from '@/lib/api';

interface RecentNewsProps {
  lang?: Language;
}

export function RecentNews({ lang = 'ru' }: RecentNewsProps) {
  const [news, setNews] = useState<any[]>(NEWS_ARTICLES.slice(0, 3));

  useEffect(() => {
    let isMounted = true;
    api.getRecentNews()
      .then((data) => {
        const list = Array.isArray(data) ? data : ((data as any)?.results || []);
        if (isMounted && list.length > 0) {
          const mapped = list.map((item: any) => ({
            id: item.id,
            title: item.title,
            title_ky: item.title_ky || item.title,
            date: item.published_at
              ? new Date(item.published_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
              : '18 Сен 2026',
            image: getMediaUrl(item.image || item.image_url) || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
          }));
          setNews(mapped.slice(0, 3));
        }
      })
      .catch((err) => {
        console.warn('Could not load recent news from API, using fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-10 sm:py-16 md:py-24 border-b border-[var(--line)] bg-[var(--bg)] transition-colors duration-500">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-7 sm:mb-12">
          <Badge variant="blue" className="mb-2.5 sm:mb-3 text-[11px] sm:text-xs">
            {lang === 'ru' ? 'НОВОСТИ И СОБЫТИЯ' : 'ЖАҢЫЛЫКТАР ЖАНА ОКУЯЛАР'}
          </Badge>
          <h2 className="text-[24px] sm:text-[32px] md:text-[40px] font-[800] text-[var(--ink)] tracking-tight mb-2.5 sm:mb-3">
            {lang === 'ru' ? 'Последние новости' : 'Акыркы жаңылыктар'}
          </h2>
          <p className="text-[13.5px] sm:text-[15px] text-[var(--muted)] leading-relaxed px-1">
            {lang === 'ru'
              ? 'Актуальная информация о студенческих выборах, обновлениях платформы Dobush.kg и ключевых событиях в вузах.'
              : 'Студенттик шайлоолор, Dobush.kg платформасынын жаңыртуулары жана ЖОЖдордогу маанилүү окуялар тууралуу маалымат.'}
          </p>
        </div>

        {/* 3 Depth Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto mb-8 sm:mb-12">
          {news.map((article) => (
            <div key={article.id} className="h-[390px] sm:h-[430px] md:h-[440px] w-full">
              <DepthCard
                image={article.image}
                maxRotation={16}
                maxTranslation={18}
                borderRadius="20px"
                spotlight={true}
                disableOnMobile={true}
                spotlightColor="rgba(37, 102, 255, 0.35)"
                href={`/news/${article.id}`}
                className="border border-black/10 dark:border-white/10 shadow-xl"
                contentClassName="justify-between bg-gradient-to-t from-black/95 via-black/60 to-black/25 text-white"
              >
                {/* Top: Date */}
                <div className="flex items-center justify-end w-full">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-md text-white/95 border border-white/20">
                    <Calendar className="w-3.5 h-3.5 text-[var(--blue-soft)]" />
                    {article.date}
                  </span>
                </div>

                {/* Bottom: Title & 'Читать полностью' Button */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-md line-clamp-3">
                    {lang === 'ky' ? article.title_ky : article.title}
                  </h3>

                  <div className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/15 text-white text-sm font-semibold backdrop-blur-md border border-white/25 transition-all duration-300 group-hover:bg-[var(--blue)] group-hover:border-[var(--blue)] shadow-md">
                    <span>{lang === 'ru' ? 'Читать полностью' : 'Толук окуу'}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </DepthCard>
            </div>
          ))}
        </div>

        {/* "Все новости" Button */}
        <div className="flex justify-center px-4">
          <Link href="/news" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all justify-center"
            >
              <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--blue)]" />
              <span>{lang === 'ru' ? 'Все новости' : 'Бардык жаңылыктар'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RecentNews;
