'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, School, GraduationCap, Users, Vote,
  CheckCircle2, Clock, AlertCircle, LogOut, ShieldCheck,
  ChevronRight, ArrowRight, Sparkles, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api, ApiError, getMediaUrl } from '@/lib/api';

export default function StudentCabinetPage() {
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [university, setUniversity] = useState<any>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('student_token');
    if (!token) {
      router.push('/vote/auth?mode=login');
      return;
    }

    // Load cached session data first
    const cachedStudent = sessionStorage.getItem('student_data');
    if (cachedStudent) {
      try {
        setStudent(JSON.parse(cachedStudent));
      } catch (e) {}
    }

    const cachedUni = sessionStorage.getItem('student_university');
    if (cachedUni) {
      try {
        setUniversity(JSON.parse(cachedUni));
      } catch (e) {}
    }

    const cachedElections = sessionStorage.getItem('cached_student_elections');
    if (cachedElections) {
      try {
        setElections(JSON.parse(cachedElections));
        setIsLoading(false);
      } catch (e) {}
    }

    // Refresh profile and load elections
    Promise.all([
      api.getStudentProfile().catch(() => null),
      api.getAvailableElections(true).catch(() => [])
    ])
      .then(([profileRes, electionsRes]) => {
        if (profileRes) {
          setStudent(profileRes);
          sessionStorage.setItem('student_data', JSON.stringify(profileRes));
          if (profileRes.university) {
            setUniversity(profileRes.university);
            sessionStorage.setItem('student_university', JSON.stringify(profileRes.university));
          }
        }
        const resolvedList = Array.isArray(electionsRes) ? electionsRes : [];
        setElections(resolvedList);
        try {
          sessionStorage.setItem('cached_student_elections', JSON.stringify(resolvedList));
        } catch (e) {}
      })
      .catch(err => {
        console.error('Failed to load cabinet data', err);
        setErrorMsg('Не удалось загрузить актуальные данные кабинета');
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('student_token');
    sessionStorage.removeItem('student_data');
    sessionStorage.removeItem('student_university');
    router.push('/vote/auth?mode=login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'СТ';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const filteredElections = elections.filter(elec => {
    if (activeFilter === 'active') {
      return elec.status === 'active';
    }
    if (activeFilter === 'completed') {
      return elec.status === 'finished' || elec.status === 'completed';
    }
    return true;
  });

  const activeCount = elections.filter(e => e.status === 'active').length;
  const votedCount = elections.filter(e => e.has_voted).length;

  if (isLoading && !student) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] text-[14px]">
        Загрузка личного кабинета...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Top Navigation Bar */}
      <header className="gtop w-full border-b border-[var(--line)] bg-[var(--surface)] sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-3.5 sm:px-6 md:px-8 h-[56px] sm:h-[62px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-[9px] bg-[var(--blue)] flex items-center justify-center text-white shadow-[var(--shadow-blue-btn)]">
                <Vote className="w-4 h-4" />
              </div>
              <span className="text-[17px] sm:text-[19px] font-[800] tracking-[-0.02em] text-[var(--ink)]">
                Dobush<span className="text-[var(--blue)]">.kg</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[var(--muted)] text-[13px] border-l border-[var(--line)] pl-3 ml-1 font-medium">
              Кабинет избирателя
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {university?.name && (
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[9px] bg-[var(--surface-2)] border border-[var(--line)] text-[12px] sm:text-[13px] text-[var(--ink)] font-medium max-w-[150px] sm:max-w-[220px]">
                <School className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" />
                <span className="truncate">{university.name}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 h-[34px] sm:h-[38px] px-2.5 sm:px-3.5 rounded-[10px] bg-[var(--surface-2)] hover:bg-[var(--red-bg)] text-[var(--muted)] hover:text-[var(--red)] border border-[var(--field-line)] hover:border-[var(--red)]/30 text-[12.5px] sm:text-[13px] font-semibold transition-all cursor-pointer"
              title="Выйти из аккаунта"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto px-3.5 sm:px-6 md:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Student Profile Card */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[18px] sm:rounded-[22px] p-4 sm:p-7 shadow-[var(--shadow-card)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start gap-3.5 sm:gap-5">
              {/* Avatar */}
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-[16px] bg-[var(--blue)] text-white flex items-center justify-center font-[800] text-[20px] sm:text-[24px] shadow-[var(--shadow-blue-btn)] shrink-0 overflow-hidden">
                {student?.photo ? (
                  <img src={getMediaUrl(student.photo)} alt={student.full_name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(student?.full_name)
                )}
              </div>

              {/* Information */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[19px] sm:text-[24px] font-[800] tracking-tight text-[var(--ink)] truncate">
                    {student?.full_name || 'Студент'}
                  </h1>
                  <Badge variant="green" dot={true}>
                    АКТИВЕН
                  </Badge>
                </div>

                {/* Info Chips */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px]">
                  {student?.email && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--muted)]">
                      <Mail className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" />
                      <span className="truncate max-w-[160px] sm:max-w-none">{student.email}</span>
                    </span>
                  )}
                  {student?.group && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--muted)]">
                      <Users className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" />
                      <span>Группа {student.group}</span>
                    </span>
                  )}
                  {student?.course && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--muted)]">
                      <GraduationCap className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" />
                      <span>{student.course} курс</span>
                    </span>
                  )}
                  {student?.student_id && (
                    <span className="inline-flex items-center px-2 py-1 rounded-[8px] bg-[var(--blue-soft)] text-[var(--blue)] font-mono text-[11.5px] font-bold">
                      ID: {student.student_id}
                    </span>
                  )}
                </div>

                <div className="text-[12.5px] sm:text-[13px] text-[var(--muted)] pt-0.5">
                  ВУЗ: <span className="font-semibold text-[var(--ink)]">{university?.name || student?.university?.name || '—'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5 sm:gap-3 shrink-0 border-t md:border-t-0 md:border-l border-[var(--line)] pt-3.5 md:pt-0 md:pl-6">
              <div className="p-3 sm:p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
                <div className="text-[11.5px] sm:text-[12px] text-[var(--muted)] font-medium">Активных выборов</div>
                <div className="text-[18px] sm:text-[22px] font-[800] text-[var(--ink)] mt-0.5">{activeCount}</div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
                <div className="text-[11.5px] sm:text-[12px] text-[var(--muted)] font-medium">Вы приняли участие</div>
                <div className="text-[18px] sm:text-[22px] font-[800] text-[var(--green)] mt-0.5">{votedCount}</div>
              </div>
            </div>
          </div>

          {/* Privacy & Cryptography banner */}
          <div className="mt-4 sm:mt-6 pt-3.5 sm:pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] sm:text-[13px] text-[var(--muted)]">
            <div className="flex items-center gap-2 text-[var(--blue)]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-medium">
                Анонимное волеизъявление защищено двухконтурным шифрованием
              </span>
            </div>
            <span className="text-[11.5px] opacity-80">
              Ваш голос строго обезличен
            </span>
          </div>
        </div>

        {/* Elections Section */}
        <div className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-[19px] sm:text-[22px] font-[800] text-[var(--ink)] tracking-tight">
                Избирательные кампании
              </h2>
              <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)]">
                Доступные голосования для вашего университета
              </p>
            </div>

            {/* Mobile Touch-Friendly Filter Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 bg-[var(--surface-2)] border border-[var(--line)] rounded-[14px]">
              <button
                onClick={() => setActiveFilter('all')}
                className={`whitespace-nowrap px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-semibold rounded-[10px] transition-all cursor-pointer shrink-0 ${
                  activeFilter === 'all'
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Все ({elections.length})
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`whitespace-nowrap px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-semibold rounded-[10px] transition-all cursor-pointer shrink-0 ${
                  activeFilter === 'active'
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Идет голосование ({activeCount})
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`whitespace-nowrap px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-semibold rounded-[10px] transition-all cursor-pointer shrink-0 ${
                  activeFilter === 'completed'
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Завершенные
              </button>
            </div>
          </div>

          {/* Elections Grid / List */}
          {filteredElections.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[18px] sm:rounded-[22px] shadow-[var(--shadow-card)] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] mx-auto">
                <Vote className="w-6 h-6" />
              </div>
              <h3 className="text-[16px] font-bold text-[var(--ink)]">
                Нет доступных кампаний в этой категории
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)] max-w-md mx-auto">
                Когда администрация вашего университета запустит новое голосование, оно немедленно появится здесь.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredElections.map((elec) => {
                const isActive = elec.status === 'active';
                const isFinished = elec.status === 'finished' || elec.status === 'completed';
                const hasVoted = Boolean(elec.has_voted);

                return (
                  <div
                    key={elec.id}
                    className="bg-[var(--surface)] border border-[var(--line)] rounded-[18px] sm:rounded-[20px] p-4 sm:p-6 shadow-[var(--shadow-card)] hover:border-[var(--blue)]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        {isActive ? (
                          hasVoted ? (
                            <Badge variant="green" dot={true}>
                              БЮЛЛЕТЕНЬ ПРИНЯТ
                            </Badge>
                          ) : (
                            <Badge variant="blue" dot={true}>
                              ГОЛОСОВАНИЕ ИДЕТ
                            </Badge>
                          )
                        ) : isFinished ? (
                          <Badge variant="gray">
                            ВЫБОРЫ ЗАВЕРШЕНЫ
                          </Badge>
                        ) : (
                          <Badge variant="amber">
                            {elec.status?.toUpperCase() || 'ОЖИДАНИЕ'}
                          </Badge>
                        )}

                        <span className="text-[12px] text-[var(--muted)] flex items-center gap-1 ml-auto">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          до {new Date(elec.ends_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-[17px] sm:text-[18px] font-bold text-[var(--ink)] leading-snug mb-1.5">
                        {elec.title}
                      </h3>

                      {elec.description && (
                        <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)] line-clamp-2 leading-relaxed mb-4">
                          {elec.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3.5 sm:pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                      <div className="text-[12.5px] text-[var(--muted)]">
                        {hasVoted ? (
                          <span className="text-[var(--green)] font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            Вы уже проголосовали
                          </span>
                        ) : isActive ? (
                          <span className="text-[var(--blue)] font-medium">
                            Ваш голос еще не учтен
                          </span>
                        ) : (
                          <span>Кампания закрыта</span>
                        )}
                      </div>

                      {isActive && !hasVoted ? (
                        <Link href={`/vote/elections/${elec.id}`} className="w-full sm:w-auto">
                          <Button variant="primary" size="sm" className="w-full sm:w-auto justify-center gap-2 shadow-[var(--shadow-blue-btn)] h-[42px] sm:h-[38px]">
                            <span>Проголосовать</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/vote/elections/${elec.id}`} className="w-full sm:w-auto">
                          <Button variant="secondary" size="sm" className="w-full sm:w-auto justify-center gap-1.5 h-[42px] sm:h-[38px]">
                            <span>{hasVoted ? 'Бюллетень' : 'Подробнее'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
