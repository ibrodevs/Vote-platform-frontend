'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { NEWS_ARTICLES } from '@/lib/newsData';
import { Language } from '@/lib/i18n';
import { api, getMediaUrl } from '@/lib/api';

export default function NewsDetailPage() {
  const params = useParams();
  const [lang, setLang] = useState<Language>('ru');
  const articleId = params?.id as string;
  const fallbackArticle = NEWS_ARTICLES.find((a) => a.id === articleId) || NEWS_ARTICLES[0];
  const [article, setArticle] = useState<any>(fallbackArticle);

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
    if (!articleId) return;
    let isMounted = true;

    api.getNewsDetail(articleId)
      .then((data) => {
        if (isMounted && data && data.id) {
          setArticle({
            ...data,
            date: data.published_at
              ? new Date(data.published_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
              : fallbackArticle.date,
            image: getMediaUrl(data.image || data.image_url) || fallbackArticle.image,
          });
        }
      })
      .catch((err) => {
        console.warn('Could not load article detail from API, using fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  const contentText = lang === 'ky' ? (article.content_ky || article.content) : article.content;
  const paragraphs: string[] = Array.isArray(contentText)
    ? contentText
    : (typeof contentText === 'string' ? contentText.split('\n\n').filter(Boolean) : []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--body)] flex flex-col font-sans transition-colors duration-500">
      {/* Header Bar with Back Button */}
      <header className="border-b border-[var(--line)] bg-[var(--surface)] py-5 sticky top-0 z-30 backdrop-blur-md bg-[var(--surface)]/90">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--blue)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Все новости' : 'Бардык жаңылыктар'}</span>
          </Link>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14 w-full">
        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] mb-3">
          <Calendar className="w-4 h-4 text-[var(--blue)]" />
          <span>{article.date}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-[800] text-[var(--ink)] tracking-tight leading-[1.25] mb-8">
          {lang === 'ky' ? article.title_ky : article.title}
        </h1>

        {/* Cover Photo */}
        <div className="relative w-full h-72 sm:h-96 md:h-[460px] rounded-2xl overflow-hidden mb-10 shadow-lg border border-[var(--line)]">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Full Description / Content */}
        <div className="space-y-6 text-[16px] sm:text-[17px] leading-relaxed text-[var(--body)]">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-[var(--body)]">
              {paragraph}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}
