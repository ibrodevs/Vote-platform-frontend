'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, School, GraduationCap, Award, BookOpen,
  User, CheckCircle2, ShieldCheck, FileText, Vote, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api, getMediaUrl } from '@/lib/api';

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const electionId = String(params.id || '');
  const candidateId = String(params.candidateId || '');

  const [candidate, setCandidate] = useState<any>(null);
  const [election, setElection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      api.getCandidateDetails(candidateId).catch(() => null),
      api.getElectionDetail(electionId).catch(() => null)
    ])
      .then(([candRes, elecRes]) => {
        if (elecRes) {
          setElection(elecRes);
        }

        if (candRes) {
          setCandidate(candRes);
        } else if (elecRes && Array.isArray(elecRes.candidates)) {
          // Fallback to finding candidate inside election details
          const found = elecRes.candidates.find((c: any) => c.id === candidateId);
          if (found) setCandidate(found);
          else setErrorMsg('Кандидат не найден');
        } else {
          setErrorMsg('Кандидат не найден');
        }
      })
      .catch((err) => {
        console.error('Failed to load candidate details', err);
        setErrorMsg('Ошибка при загрузке анкеты кандидата');
      })
      .finally(() => setIsLoading(false));
  }, [electionId, candidateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="crm-card p-10 text-center max-w-sm w-full">
          <div className="w-10 h-10 border-3 border-[var(--blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[15px] font-bold text-[var(--ink)]">Загрузка анкеты кандидата...</p>
          <p className="text-[13px] text-[var(--muted)] mt-1">Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !candidate) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="crm-card p-8 sm:p-10 text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-[14px] bg-[var(--red-bg)] text-[var(--red)] flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-[20px] font-bold text-[var(--ink)] mb-2">Анкета не найдена</h2>
          <p className="text-[14px] text-[var(--muted)] mb-6">
            {errorMsg || 'Запрошенный кандидат не существует или был удален.'}
          </p>
          <Link href={`/vote/elections/${electionId}`}>
            <Button variant="primary" className="w-full justify-center">
              Вернуться к голосованию
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const photoSrc = !imgError && (candidate.photo || candidate.photo_url)
    ? getMediaUrl(candidate.photo || candidate.photo_url)
    : null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 sm:pb-32">
      {/* Top Sticky Header */}
      <header className="gtop w-full px-4 sm:px-8 py-3.5 border-b border-[var(--line)] bg-[var(--surface)] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[900px] mx-auto flex items-center justify-between gap-3">
          <Link
            href={`/vote/elections/${electionId}`}
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Назад к бюллетеню</span>
            <span className="sm:hidden">Назад</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="blue" dot={true}>
              АНКЕТА КАНДИДАТА
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-[900px] mx-auto px-4 sm:px-8 pt-6 sm:pt-10 space-y-6">
        {/* Candidate Profile Hero Card */}
        <div className="crm-card p-6 sm:p-9">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
            {/* Candidate Photo / Big Avatar */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[22px] sm:rounded-[26px] bg-[var(--surface-2)] border-2 border-[var(--line)] overflow-hidden flex items-center justify-center text-[var(--blue)] font-bold text-4xl shadow-md">
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={candidate.full_name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span>{candidate.full_name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[var(--blue)] text-white flex items-center justify-center shadow-md border-2 border-[var(--surface)]">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Candidate Identity Details */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge variant="blue">
                  {candidate.position || 'Кандидат'}
                </Badge>
                {candidate.order !== undefined && (
                  <Badge variant="gray">
                    Номер в бюллетене: #{candidate.order + 1}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-[800] text-[var(--ink)] tracking-tight leading-tight">
                {candidate.full_name}
              </h1>

              {/* University & Election context */}
              <div className="flex flex-col gap-1 text-[13.5px] text-[var(--muted)]">
                {(candidate.election_title || election?.title) && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 font-medium text-[var(--ink)]">
                    <Vote className="w-4 h-4 text-[var(--blue)] shrink-0" />
                    <span className="truncate">{candidate.election_title || election?.title}</span>
                  </div>
                )}
                {(candidate.university_name || election?.university_name || election?.university_details?.name) && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <School className="w-4 h-4 text-[var(--muted)] shrink-0" />
                    <span className="truncate">{candidate.university_name || election?.university_name || election?.university_details?.name}</span>
                  </div>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="pt-2 grid grid-cols-2 gap-2.5 max-w-md mx-auto sm:mx-0 text-left">
                <div className="p-3 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-bold block mb-0.5">
                    Факультет
                  </span>
                  <span className="text-[13.5px] font-bold text-[var(--ink)] truncate block">
                    {candidate.faculty || 'Не указан'}
                  </span>
                </div>

                <div className="p-3 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-bold block mb-0.5">
                    Курс обучения
                  </span>
                  <span className="text-[13.5px] font-bold text-[var(--ink)] block">
                    {candidate.course ? `${candidate.course} курс` : 'Не указан'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Short Bio Section */}
        <div className="crm-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--line)]">
            <div className="w-8 h-8 rounded-[9px] bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-[18px] font-bold text-[var(--ink)]">
              Краткая биография
            </h2>
          </div>

          <div className="text-[14.5px] sm:text-[15px] text-[var(--body)] leading-relaxed pt-1 whitespace-pre-wrap">
            {candidate.short_bio ? (
              candidate.short_bio
            ) : (
              <span className="text-[var(--muted)] italic">Краткая биография не заполнена кандидатом.</span>
            )}
          </div>
        </div>

        {/* Election Program Section */}
        <div className="crm-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--line)]">
            <div className="w-8 h-8 rounded-[9px] bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-[18px] font-bold text-[var(--ink)]">
              Предвыборная программа
            </h2>
          </div>

          <div className="text-[14.5px] sm:text-[15px] text-[var(--body)] leading-relaxed pt-1 whitespace-pre-wrap">
            {candidate.program ? (
              candidate.program
            ) : (
              <span className="text-[var(--muted)] italic">Предвыборная программа не заполнена кандидатом.</span>
            )}
          </div>
        </div>

        {/* Guarantee of Anonymity Note */}
        <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] flex items-start gap-3 text-[13px] text-[var(--muted)]">
          <ShieldCheck className="w-5 h-5 text-[var(--blue)] shrink-0 mt-0.5" />
          <p>
            Голосование в платформе Dobush.kg является полностью тайным и анонимным. Информация о вашем голосе физически отделена от персонального аккаунта студента.
          </p>
        </div>
      </main>

      {/* Floating Bottom Bar for Mobile & Desktop */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] z-40">
        <div className="max-w-[900px] mx-auto flex items-center justify-between gap-4">
          <Link href={`/vote/elections/${electionId}`} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 shadow-[var(--shadow-blue-btn)] justify-center">
              <ArrowLeft className="w-4 h-4" />
              <span>Перейти к бюллетеню и проголосовать</span>
            </Button>
          </Link>

          <Link href={`/vote/elections/${electionId}`} className="hidden sm:inline-block">
            <Button variant="secondary" size="lg">
              Назад к выборам
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
