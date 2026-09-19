'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  Search,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DepthCard } from '@/components/ui/depth-card';
import { NEWS_ARTICLES } from '@/lib/newsData';
import { Language } from '@/lib/i18n';
import { api, getMediaUrl } from '@/lib/api';

export default function NewsPage() {
  const [lang, setLang] = useState<Language>('ru');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [articles, setArticles] = useState<any[]>(NEWS_ARTICLES);

  useEffect(() => {
    const currentLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(currentLang);

    const onLangChange = () => {
      setLang((localStorage.getItem('app_lang') as Language) || 'ru');
    };
    window.addEventListener('languageChange', onLangChange);
    return () => window.removeEventListener('languageChange', onLangChange);
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.getNews({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchQuery || undefined,
    })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.results || []);
        if (isMounted && list.length > 0) {
          const mapped = list.map((item: any) => ({
            id: item.id,
            title: item.title,
            title_ky: item.title_ky || item.title,
            summary: item.summary,
            summary_ky: item.summary_ky,
            category: item.category,
            date: item.published_at
              ? new Date(item.published_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
              : '18 Сен 2026',
            image: getMediaUrl(item.image || item.image_url) || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
          }));
          setArticles(mapped);
        }
      })
      .catch((err) => {
        console.warn('Could not load news from API, using fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  const categories = [
    { id: 'all', label: lang === 'ru' ? 'Все новости' : 'Бардык жаңылыктар' },
    { id: 'official', label: lang === 'ru' ? 'Официально' : 'Расмий' },
    { id: 'elections', label: lang === 'ru' ? 'Выборы' : 'Шайлоо' },
    { id: 'tech', label: lang === 'ru' ? 'Технологии' : 'Технология' },
    { id: 'students', label: lang === 'ru' ? 'Студенчество' : 'Студенттер' },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === 'all' || article.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      article.title?.toLowerCase().includes(q) ||
      article.title_ky?.toLowerCase().includes(q) ||
      article.summary?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--body)] flex flex-col font-sans transition-colors duration-500">
      {/* Top Breadcrumbs & Hero */}
      <div className="border-b border-[var(--line)] bg-[var(--surface)] py-8 md:py-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--blue)] transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Вернуться на главную' : 'Башкы бетке кайтуу'}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Badge variant="blue" className="mb-3">
                {lang === 'ru' ? 'МЕДИА И СОБЫТИЯ' : 'МЕДИА ЖАНА ОКУЯЛАР'}
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-[800] text-[var(--ink)] tracking-tight mb-3">
                {lang === 'ru' ? 'Новости Dobush.kg' : 'Dobush.kg жаңылыктары'}
              </h1>
              <p className="text-[15px] sm:text-[16px] text-[var(--muted)] max-w-2xl leading-relaxed">
                {lang === 'ru'
                  ? 'Официальные заявления, отчёты о ходе голосования, технологические обновления и события студенческого самоуправления.'
                  : 'Расмий билдирүүлөр, добуш берүүнүн жүрүшү боюнча отчеттор, технологиялык жаңылыктар жана студенттик өзүн-өзү башкаруу окуялары.'}
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'ru' ? 'Поиск по новостям...' : 'Жаңылыктарды издөө...'}
                  className="crm-input pl-10 h-11"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-8 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--blue)] text-white shadow-sm shadow-[var(--blue)]/30'
                    : 'bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Articles Grid */}
      <main className="flex-1 max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16 w-full">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface)] rounded-2xl border border-[var(--line)] p-8">
            <Newspaper className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold text-[var(--ink)] mb-2">
              {lang === 'ru' ? 'Новости не найдены' : 'Жаңылыктар табылган жок'}
            </h3>
            <p className="text-sm text-[var(--muted)] mb-6">
              {lang === 'ru'
                ? 'Попробуйте изменить запрос или выбрать другую категорию.'
                : 'Суроо-талапты өзгөртүп же башка категорияны тандап көрүңүз.'}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              {lang === 'ru' ? 'Сбросить фильтры' : 'Чыпкаларды тазалоо'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <div key={article.id} className="h-[460px] w-full">
                <DepthCard
                  image={article.image}
                  maxRotation={16}
                  maxTranslation={18}
                  borderRadius="20px"
                  spotlight={true}
                  spotlightColor="rgba(37, 102, 255, 0.35)"
                  href={`/news/${article.id}`}
                  className="border border-black/10 dark:border-white/10 shadow-lg hover:shadow-2xl"
                  contentClassName="justify-between bg-gradient-to-t from-black/95 via-black/60 to-black/25 text-white"
                >
                  {/* Top: Date */}
                  <div className="flex items-center justify-end w-full">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-md text-white/95 border border-white/20">
                      <Calendar className="w-3.5 h-3.5 text-[var(--blue-soft)]" />
                      {article.date}
                    </span>
                  </div>

                  {/* Bottom: Title & 'Читать полностью' Button */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white leading-snug drop-shadow-md line-clamp-3">
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
        )}
      </main>
    </div>
  );
}
