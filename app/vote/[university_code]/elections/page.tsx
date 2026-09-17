'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vote, CheckCircle2, Clock, UserCheck, ChevronRight, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { translations, Language } from '@/lib/i18n';

export default function StudentElectionsListPage() {
  const params = useParams();
  const router = useRouter();
  const uniCode = String(params.university_code || '').toLowerCase();

  const [lang, setLang] = useState<Language>('ru');
  const [elections, setElections] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(currentLang);

    // Verify student token exists
    const token = sessionStorage.getItem('student_token');
    if (!token) {
      router.push(`/vote/${uniCode}/login`);
      return;
    }

    const savedStudent = sessionStorage.getItem('student_data');
    if (savedStudent) {
      try {
        setStudentData(JSON.parse(savedStudent));
      } catch (e) {}
    }

    api.getAvailableElections()
      .then(data => setElections(data || []))
      .catch(err => {
        console.error('Failed to load available elections', err);
      })
      .finally(() => setIsLoading(false));
  }, [uniCode, router]);

  const t = translations[lang];

  const handleStudentLogout = () => {
    sessionStorage.removeItem('student_token');
    sessionStorage.removeItem('student_data');
    router.push(`/vote/${uniCode}/login`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] py-10 md:py-16 text-[var(--body)]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Student Session Header Card */}
        <div className="crm-card p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] font-bold text-[16px] border border-[var(--blue)]/20 shadow-sm">
              {studentData?.full_name?.slice(0, 2).toUpperCase() || 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[var(--ink)] text-[16px]">
                  {studentData?.full_name || 'Студент'}
                </span>
                <Badge variant="green" dot={true}>
                  АВТОРИЗОВАН
                </Badge>
              </div>
              <p className="text-[13px] text-[var(--muted)] mt-0.5">
                ID: {studentData?.student_id} • {studentData?.faculty} • {studentData?.course} курс
              </p>
            </div>
          </div>

          <button
            onClick={handleStudentLogout}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] text-[13px] font-medium text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--red-bg)] transition-colors cursor-pointer border border-[var(--field-line)]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>
        </div>

        {/* Elections Title */}
        <div className="max-w-2xl mb-8">
          <span className="text-[12px] uppercase tracking-wider text-[var(--muted)] block mb-2 font-bold">
            ДОСТУПНЫЕ КАМПАНИИ
          </span>
          <h1 className="text-[28px] sm:text-[34px] font-[800] text-[var(--ink)] tracking-tight">
            {t.active_elections}
          </h1>
        </div>

        {/* Elections List */}
        {isLoading ? (
          <div className="p-12 text-center text-[var(--muted)] text-[14px] crm-card">
            Загрузка списка выборов...
          </div>
        ) : elections.length === 0 ? (
          <div className="crm-card text-center p-10 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-[14px] bg-[var(--green-bg)] mx-auto mb-3.5 flex items-center justify-center text-[var(--green)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-bold text-[var(--ink)] mb-2">
              {lang === 'ru' ? 'Нет доступных активных выборов' : 'Жеткиликтүү ачык шайлоолор жок'}
            </h3>
            <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
              {lang === 'ru'
                ? 'Вы уже проголосовали во всех текущих выборах или голосование еще не открыто.'
                : 'Сиз учурдагы бардык шайлоолордо добуш бердиңиз же шайлоо али ачыла элек.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-w-4xl">
            {elections.map(election => (
              <div
                key={election.id}
                className="crm-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[var(--blue)]/40 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <Badge variant="green" dot={true}>
                      {t.status_active}
                    </Badge>
                    <span className="text-[13px] text-[var(--muted)] font-medium">
                      Кандидатов: {election.candidates?.length || 0}
                    </span>
                  </div>

                  <h3 className="text-[20px] font-bold text-[var(--ink)] tracking-tight mb-1.5">
                    {lang === 'ky' && election.title_ky ? election.title_ky : election.title}
                  </h3>

                  <p className="text-[14px] text-[var(--muted)] leading-relaxed mb-4">
                    {lang === 'ky' && election.description_ky ? election.description_ky : election.description}
                  </p>

                  <div className="flex items-center gap-4 text-[13px] text-[var(--muted)]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--blue)]" />
                      До: {new Date(election.ends_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'ky-KG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <Link href={`/vote/${uniCode}/elections/${election.id}`}>
                    <Button variant="primary" size="md" className="w-full md:w-auto justify-center gap-1.5">
                      <span>{t.select_candidate}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
