'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vote, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { translations, Language } from '@/lib/i18n';

export default function UniversityPortalPage() {
  const params = useParams();
  const router = useRouter();
  const uniCode = String(params.university_code || '').toLowerCase();

  const [lang, setLang] = useState<Language>('ru');
  const [university, setUniversity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(currentLang);

    const onLangChange = () => {
      setLang((localStorage.getItem('app_lang') as Language) || 'ru');
    };
    window.addEventListener('languageChange', onLangChange);

    api.getUniversityInfo(uniCode)
      .then(data => setUniversity(data))
      .catch(err => {
        console.error('Failed to load university info', err);
        setUniversity({
          code: uniCode,
          name: uniCode === 'kstu' ? 'Кыргызский государственный технический университет им. И. Раззакова' : 'Американский университет в Центральной Азии',
          name_ky: uniCode === 'kstu' ? 'И. Раззаков атындагы Кыргыз мамлекеттик техникалык университети' : 'Борбордук Азиядагы Америка Университети'
        });
      })
      .finally(() => setIsLoading(false));

    return () => window.removeEventListener('languageChange', onLangChange);
  }, [uniCode]);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--body)] py-12 md:py-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13.5px] text-[var(--muted)] mb-8">
          <Link href="/" className="hover:text-[var(--ink)] transition-colors flex items-center gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Все университеты</span>
          </Link>
          <span>/</span>
          <span className="text-[var(--ink)] font-bold uppercase">{uniCode}</span>
        </div>

        {/* University Header */}
        <div className="max-w-3xl mb-10">
          <div className="mb-4">
            <Badge variant="blue" dot={true}>
              {lang === 'ru' ? 'ПОРТАЛ ВЫБОРОВ' : 'ШАЙЛОО ПОРТАЛЫ'}
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-[800] text-[var(--ink)] tracking-tight leading-tight mb-4">
            {lang === 'ky' && university?.name_ky ? university.name_ky : university?.name || 'Университет'}
          </h1>
          <p className="text-[16px] text-[var(--muted)] leading-relaxed">
            {lang === 'ru'
              ? 'Добро пожаловать в защищенную систему тайного голосования. Для участия в действующих выборах пройдите идентификацию по номеру студенческого билета.'
              : 'Жашыруун добуш берүүнүн коопсуз тутумуна кош келиңиз. Учурдагы шайлоолорго катышуу үчүн студенттик билетиңиздин номери аркылуу кириңиз.'
            }
          </p>
        </div>

        {/* Action card */}
        <div className="max-w-md">
          <div className="crm-card p-7 sm:p-8">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-[12px] bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] shrink-0">
                <Vote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[var(--ink)]">
                  {lang === 'ru' ? 'Вход для избирателей' : 'Шайлоочулар үчүн кирүү'}
                </h3>
                <p className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                  SMS OTP ВЕРИФИКАЦИЯ
                </p>
              </div>
            </div>

            <p className="text-[13.5px] text-[var(--muted)] mb-6 leading-relaxed">
              {lang === 'ru'
                ? 'Идентификация подтверждает право на участие в выборах. После отправки голоса связь между студентом и бюллетенем не сохраняется.'
                : 'Идентификация шайлоого катышуу укугуңузду тастыктайт. Добуш жөнөтүлгөндөн кийин студент менен бюллетендин байланышы сакталбайт.'
              }
            </p>

            <Link href={`/vote/${uniCode}/login`} className="block">
              <Button variant="primary" size="md" className="w-full justify-center gap-2">
                <span>{lang === 'ru' ? 'Авторизоваться как студент' : 'Студент катары кирүү'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
