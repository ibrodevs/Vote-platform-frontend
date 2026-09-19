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

  const [lang, setLang] = useState<'ru' | 'ky'>('ru');
  const [student, setStudent] = useState<any>(null);
  const [university, setUniversity] = useState<any>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const currentLang = (localStorage.getItem('app_lang') as 'ru' | 'ky') || 'ru';
    setLang(currentLang);

    const onLangChange = () => {
      setLang((localStorage.getItem('app_lang') as 'ru' | 'ky') || 'ru');
    };
    window.addEventListener('languageChange', onLangChange);
    return () => window.removeEventListener('languageChange', onLangChange);
  }, []);

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

  const t = {
    loadingCabinet: lang === 'ru' ? 'Загрузка личного кабинета...' : 'Жеке кабинет жүктөлүүдө...',
    voterCabinet: lang === 'ru' ? 'Кабинет избирателя' : 'Шайлоочунун кабинети',
    logout: lang === 'ru' ? 'Выйти' : 'Чыгуу',
    logoutTitle: lang === 'ru' ? 'Выйти из аккаунта' : 'Аккаунттан чыгуу',
    active: lang === 'ru' ? 'АКТИВЕН' : 'АКТИВДҮҮ',
    student: lang === 'ru' ? 'Студент' : 'Студент',
    group: (g: string) => lang === 'ru' ? `Группа ${g}` : `Топ ${g}`,
    course: (c: number) => lang === 'ru' ? `${c} курс` : `${c}-курс`,
    university: lang === 'ru' ? 'ВУЗ:' : 'ЖОЖ:',
    activeElections: lang === 'ru' ? 'Активных выборов' : 'Активдүү шайлоолор',
    youParticipated: lang === 'ru' ? 'Вы приняли участие' : 'Сиз катыштыңыз',
    cryptoSecurity: lang === 'ru' ? 'Анонимное волеизъявление защищено двухконтурным шифрованием' : 'Анонимдүү добуш берүү эки контурлуу шифрлөө менен корголгон',
    voteImpersonal: lang === 'ru' ? 'Ваш голос строго обезличен' : 'Сиздин добушуңуз толугу менен жашыруун',
    electionCampaigns: lang === 'ru' ? 'Избирательные кампании' : 'Шайлоо өнөктүктөрү',
    availableElectionsDesc: lang === 'ru' ? 'Доступные голосования для вашего университета' : 'Университетиңиз үчүн жеткиликтүү добуш берүүлөр',
    filterAll: (n: number) => lang === 'ru' ? `Все (${n})` : `Баары (${n})`,
    filterActive: (n: number) => lang === 'ru' ? `Идет голосование (${n})` : `Добуш берүү жүрүүдө (${n})`,
    filterCompleted: lang === 'ru' ? 'Завершенные' : 'Аяктагандар',
    noCampaigns: lang === 'ru' ? 'Нет доступных кампаний в этой категории' : 'Бул категорияда жеткиликтүү кампаниялар жок',
    noCampaignsDesc: lang === 'ru' ? 'Когда администрация вашего университета запустит новое голосование, оно немедленно появится здесь.' : 'Университетиңиздин администрациясы жаңы шайлоону баштаганда, ал дароо бул жерде пайда болот.',
    badgeAccepted: lang === 'ru' ? 'БЮЛЛЕТЕНЬ ПРИНЯТ' : 'БЮЛЛЕТЕНЬ КАБЫЛ АЛЫНДЫ',
    badgeVotingActive: lang === 'ru' ? 'ГОЛОСОВАНИЕ ИДЕТ' : 'ДОБУШ БЕРҮҮ ЖҮРҮҮДӨ',
    badgeFinished: lang === 'ru' ? 'ВЫБОРЫ ЗАВЕРШЕНЫ' : 'ШАЙЛОО АЯКТАДЫ',
    badgePending: lang === 'ru' ? 'ОЖИДАНИЕ' : 'КҮТҮҮДӨ',
    until: (d: string) => lang === 'ru' ? `до ${d}` : `${d} чейин`,
    alreadyVoted: lang === 'ru' ? 'Вы уже проголосовали' : 'Сиз добуш бердиңиз',
    voteNotCounted: lang === 'ru' ? 'Ваш голос еще не учтен' : 'Сиздин добушуңуз каттала элек',
    campaignClosed: lang === 'ru' ? 'Кампания закрыта' : 'Кампания жабык',
    voteBtn: lang === 'ru' ? 'Проголосовать' : 'Добуш берүү',
    ballotBtn: lang === 'ru' ? 'Бюллетень' : 'Бюллетень',
    detailsBtn: lang === 'ru' ? 'Подробнее' : 'Кененирээк',
  };

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

  const getUniId = (objOrId: any) => {
    if (!objOrId) return '';
    if (typeof objOrId === 'string') return objOrId;
    return objOrId.id || objOrId.uuid || objOrId.pk || '';
  };

  const studentUniId = getUniId(student?.university) || getUniId(university) || student?.university_id;

  // Filter elections strictly to the student's university
  const uniElections = elections.filter(elec => {
    const elecUniId = getUniId(elec.university) || getUniId(elec.university_details);
    if (studentUniId && elecUniId && String(elecUniId) !== String(studentUniId)) {
      return false;
    }
    return true;
  });

  const filteredElections = uniElections.filter(elec => {
    if (activeFilter === 'active') {
      return elec.status === 'active';
    }
    if (activeFilter === 'completed') {
      return elec.status === 'finished' || elec.status === 'completed';
    }
    return true;
  });

  const activeCount = uniElections.filter(e => e.status === 'active').length;
  const votedCount = uniElections.filter(e => e.has_voted).length;

  if (isLoading && !student) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] text-[14px]">
        {t.loadingCabinet}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Top Navigation Bar */}
      <header className="gtop w-full border-b border-[var(--line)] bg-[var(--surface)] sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-3.5 sm:px-6 md:px-8 h-[56px] sm:h-[62px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Dobush.kg Logo"
                className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] object-contain rounded-[8px]"
              />
              <span className="text-[17px] sm:text-[19px] font-[800] tracking-[-0.02em] text-[var(--ink)]">
                Dobush<span className="text-[var(--blue)]">.kg</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[var(--muted)] text-[13px] border-l border-[var(--line)] pl-3 ml-1 font-medium">
              {t.voterCabinet}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {(university?.name || student?.university?.name) && (
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[9px] bg-[var(--surface-2)] border border-[var(--line)] text-[12px] sm:text-[13px] text-[var(--ink)] font-medium max-w-[150px] sm:max-w-[220px]">
                <School className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" />
                <span className="truncate">
                  {lang === 'ky' && (university?.name_ky || student?.university?.name_ky)
                    ? (university?.name_ky || student?.university?.name_ky)
                    : (university?.name || student?.university?.name)}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 h-[34px] sm:h-[38px] px-2.5 sm:px-3.5 rounded-[10px] bg-[var(--surface-2)] hover:bg-[var(--red-bg)] text-[var(--muted)] hover:text-[var(--red)] border border-[var(--field-line)] hover:border-[var(--red)]/30 text-[12.5px] sm:text-[13px] font-semibold transition-all cursor-pointer"
              title={t.logoutTitle}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">{t.logout}</span>
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
                    {student?.full_name || t.student}
                  </h1>
                  <Badge variant="green" dot={true}>
                    {t.active}
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
                      <span>{t.group(student.group)}</span>
                    </span>
                  )}
                  {student?.course && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--muted)]">
                      <GraduationCap className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" />
                      <span>{t.course(student.course)}</span>
                    </span>
                  )}
                  {student?.student_id && (
                    <span className="inline-flex items-center px-2 py-1 rounded-[8px] bg-[var(--blue-soft)] text-[var(--blue)] font-mono text-[11.5px] font-bold">
                      ID: {student.student_id}
                    </span>
                  )}
                </div>

                <div className="text-[12.5px] sm:text-[13px] text-[var(--muted)] pt-0.5">
                  {t.university} <span className="font-semibold text-[var(--ink)]">
                    {lang === 'ky' && (university?.name_ky || student?.university?.name_ky)
                      ? (university?.name_ky || student?.university?.name_ky)
                      : (university?.name || student?.university?.name || '—')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5 sm:gap-3 shrink-0 border-t md:border-t-0 md:border-l border-[var(--line)] pt-3.5 md:pt-0 md:pl-6">
              <div className="p-3 sm:p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
                <div className="text-[11.5px] sm:text-[12px] text-[var(--muted)] font-medium">{t.activeElections}</div>
                <div className="text-[18px] sm:text-[22px] font-[800] text-[var(--ink)] mt-0.5">{activeCount}</div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
                <div className="text-[11.5px] sm:text-[12px] text-[var(--muted)] font-medium">{t.youParticipated}</div>
                <div className="text-[18px] sm:text-[22px] font-[800] text-[var(--green)] mt-0.5">{votedCount}</div>
              </div>
            </div>
          </div>

          {/* Privacy & Cryptography banner */}
          <div className="mt-4 sm:mt-6 pt-3.5 sm:pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] sm:text-[13px] text-[var(--muted)]">
            <div className="flex items-center gap-2 text-[var(--blue)]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-medium">
                {t.cryptoSecurity}
              </span>
            </div>
            <span className="text-[11.5px] opacity-80">
              {t.voteImpersonal}
            </span>
          </div>
        </div>

        {/* Elections Section */}
        <div className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-[19px] sm:text-[22px] font-[800] text-[var(--ink)] tracking-tight">
                {t.electionCampaigns}
              </h2>
              <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)]">
                {t.availableElectionsDesc}
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
                {t.filterAll(elections.length)}
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`whitespace-nowrap px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-semibold rounded-[10px] transition-all cursor-pointer shrink-0 ${
                  activeFilter === 'active'
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {t.filterActive(activeCount)}
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`whitespace-nowrap px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-semibold rounded-[10px] transition-all cursor-pointer shrink-0 ${
                  activeFilter === 'completed'
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {t.filterCompleted}
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
                {t.noCampaigns}
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)] max-w-md mx-auto">
                {t.noCampaignsDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredElections.map((elec) => {
                const isActive = elec.status === 'active';
                const isFinished = elec.status === 'finished' || elec.status === 'completed';
                const hasVoted = Boolean(elec.has_voted);
                const title = lang === 'ky' && elec.title_ky ? elec.title_ky : elec.title;
                const desc = lang === 'ky' && elec.description_ky ? elec.description_ky : elec.description;

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
                              {t.badgeAccepted}
                            </Badge>
                          ) : (
                            <Badge variant="blue" dot={true}>
                              {t.badgeVotingActive}
                            </Badge>
                          )
                        ) : isFinished ? (
                          <Badge variant="gray">
                            {t.badgeFinished}
                          </Badge>
                        ) : (
                          <Badge variant="amber">
                            {elec.status?.toUpperCase() || t.badgePending}
                          </Badge>
                        )}

                        <span className="text-[12px] text-[var(--muted)] flex items-center gap-1 ml-auto">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {t.until(new Date(elec.ends_at).toLocaleDateString(lang === 'ky' ? 'ky-KG' : 'ru-RU'))}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-[17px] sm:text-[18px] font-bold text-[var(--ink)] leading-snug mb-1.5">
                        {title}
                      </h3>

                      {desc && (
                        <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)] line-clamp-2 leading-relaxed mb-4">
                          {desc}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3.5 sm:pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                      <div className="text-[12.5px] text-[var(--muted)]">
                        {hasVoted ? (
                          <span className="text-[var(--green)] font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {t.alreadyVoted}
                          </span>
                        ) : isActive ? (
                          <span className="text-[var(--blue)] font-medium">
                            {t.voteNotCounted}
                          </span>
                        ) : (
                          <span>{t.campaignClosed}</span>
                        )}
                      </div>

                      {isActive && !hasVoted ? (
                        <Link href={`/vote/elections/${elec.id}`} className="w-full sm:w-auto">
                          <Button variant="primary" size="sm" className="w-full sm:w-auto justify-center gap-2 shadow-[var(--shadow-blue-btn)] h-[42px] sm:h-[38px]">
                            <span>{t.voteBtn}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/vote/elections/${elec.id}`} className="w-full sm:w-auto">
                          <Button variant="secondary" size="sm" className="w-full sm:w-auto justify-center gap-1.5 h-[42px] sm:h-[38px]">
                            <span>{hasVoted ? t.ballotBtn : t.detailsBtn}</span>
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
