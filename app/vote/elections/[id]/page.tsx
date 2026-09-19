'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Shield, Check, User, BookOpen, CheckCircle2,
  AlertCircle, ArrowRight, Lock, ArrowLeft, School,
  Clock, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { api, ApiError, getMediaUrl } from '@/lib/api';

export default function DirectElectionBallotPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = String(params.id || '');

  const [lang, setLang] = useState<'ru' | 'ky'>('ru');
  const [student, setStudent] = useState<any>(null);
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votedAt, setVotedAt] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Modals
  const [programModalCandidate, setProgramModalCandidate] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

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
      // Redirect to unified registration/login with back-link
      router.push(`/vote/auth?election=${electionId}`);
      return;
    }

    const savedStudent = sessionStorage.getItem('student_data');
    if (savedStudent) {
      try {
        setStudent(JSON.parse(savedStudent));
      } catch (e) {}
    }

    let hasCached = false;
    const cachedElectionStr = sessionStorage.getItem(`cached_election_${electionId}`);
    if (cachedElectionStr) {
      try {
        const cached = JSON.parse(cachedElectionStr);
        setElection(cached);
        if (cached.candidates?.length) {
          setCandidates(cached.candidates);
        }
        if (cached.has_voted) {
          setHasVoted(true);
        }
        hasCached = true;
      } catch (e) {}
    }

    const cachedCandidatesStr = sessionStorage.getItem(`cached_candidates_${electionId}`);
    if (cachedCandidatesStr) {
      try {
        const cands = JSON.parse(cachedCandidatesStr);
        if (cands?.length) {
          setCandidates(cands);
          hasCached = true;
        }
      } catch (e) {}
    }

    if (hasCached) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // 1. Fetch Election details & Candidates in background
    Promise.all([
      api.getElectionDetail(electionId),
      api.getElectionCandidates(electionId).catch(() => []),
      api.getVotingStatus(electionId).catch(() => ({ has_voted: false }))
    ])
      .then(([electionData, candidatesData, statusRes]) => {
        setElection(electionData);
        const resolvedCandidates = (candidatesData && candidatesData.length > 0)
          ? candidatesData
          : (electionData.candidates || []);
        setCandidates(resolvedCandidates);

        try {
          sessionStorage.setItem(`cached_election_${electionId}`, JSON.stringify(electionData));
          sessionStorage.setItem(`cached_candidates_${electionId}`, JSON.stringify(resolvedCandidates));
        } catch (e) {}

        if (statusRes?.has_voted || electionData?.has_voted) {
          setHasVoted(true);
          setVotedAt((statusRes as any)?.voted_at || null);
        }
      })
      .catch(err => {
        console.error('Failed to load election data', err);
        if (!hasCached) {
          setErrorMsg(lang === 'ru' ? 'Не удалось загрузить данные выборов' : 'Шайлоо маалыматтарын жүктөө мүмкүн болбоду');
        }
      })
      .finally(() => setIsLoading(false));
  }, [electionId, router, lang]);

  const t = {
    loadingBallot: lang === 'ru' ? 'Загрузка избирательного бюллетеня...' : 'Шайлоо бюллетени жүктөлүүдө...',
    electionNotFound: lang === 'ru' ? 'Выборы не найдены' : 'Шайлоо табылган жок',
    electionNotFoundDesc: lang === 'ru' ? 'Запрошенное голосование не существует или было удалено.' : 'Суралган шайлоо жок же өчүрүлгөн.',
    toCabinet: lang === 'ru' ? 'В личный кабинет' : 'Жеке кабинетке',
    notAvailableForUni: lang === 'ru' ? 'Недоступно для вашего университета' : 'Сиздин университетиңиз үчүн жеткиликтүү эмес',
    notAvailableDesc: (uni: string) => lang === 'ru'
      ? `Вы зарегистрированы в другом учебном заведении. Данное голосование проводится исключительно для студентов ${uni}.`
      : `Сиз башка окуу жайында катталгансыз. Бул добуш берүү ${uni} студенттери үчүн гана өткөрүлөт.`,
    goToOwnCabinet: lang === 'ru' ? 'Перейти в свой личный кабинет' : 'Өзүңүздүн жеке кабинетиңизге өтүү',
    badgeAccepted: lang === 'ru' ? 'БЮЛЛЕТЕНЬ ПРИНЯТ' : 'БЮЛЛЕТЕНЬ КАБЫЛ АЛЫНДЫ',
    voteAcceptedTitle: lang === 'ru' ? 'Ваш голос принят!' : 'Сиздин добушуңуз кабыл алынды!',
    alreadyVotedTitle: lang === 'ru' ? 'Вы уже проголосовали' : 'Сиз добуш бердиңиз',
    voteAcceptedDesc: lang === 'ru' ? 'Бюллетень успешно обезличен и сохранен в криптографическом реестре.' : 'Бюллетень ийгиликтүү жашырылып, криптографиялык реестрге сакталды.',
    alreadyVotedDesc: lang === 'ru' ? 'Ваш электронный бюллетень по этой кампании уже был учтен ранее.' : 'Бул кампания боюнча электрондук бюллетениңиз буга чейин эсепке алынган.',
    campaignLabel: lang === 'ru' ? 'Кампания:' : 'Кампания:',
    ballotStatusLabel: lang === 'ru' ? 'Статус бюллетеня:' : 'Бюллетендин абалы:',
    ballotStatusVal: lang === 'ru' ? 'ОБЕЗЛИЧЕН И УЧТЕН' : 'ЖАШЫРЫЛДЫ ЖАНА ЭСЕПКЕ АЛЫНДЫ',
    timeLabel: lang === 'ru' ? 'Время фиксации:' : 'Катталган убактысы:',
    secrecyLabel: lang === 'ru' ? 'Тайна голосования' : 'Добуш берүү купуялуулугу',
    protectionVal: lang === 'ru' ? '100% защита' : '100% корголгон',
    returnToCabinet: lang === 'ru' ? 'Вернуться в личный кабинет' : 'Жеке кабинетке кайтуу',
    electionFinished: lang === 'ru' ? 'ВЫБОРЫ ЗАВЕРШЕНЫ' : 'ШАЙЛОО АЯКТАДЫ',
    timeExpiredBadge: lang === 'ru' ? 'ВРЕМЯ ИСТЕКЛО' : 'УБАКЫТ АЯКТАДЫ',
    timeExpiredTitle: lang === 'ru' ? 'Время голосования истекло' : 'Добуш берүү убактысы аяктады',
    timeExpiredDesc: (d: string) => lang === 'ru'
      ? `Прием голосов по данной избирательной кампании официально окончен${d ? ` (${d})` : ''}. Вы больше не можете подать свой голос.`
      : `Бул шайлоо өнөктүгү боюнча добуштарды кабыл алуу расмий аяктады${d ? ` (${d})` : ''}. Сиз мындан ары добуш бере албайсыз.`,
    votingNotActive: lang === 'ru' ? 'ГОЛОСОВАНИЕ НЕ АКТИВНО' : 'ДОБУШ БЕРҮҮ АКТИВДҮҮ ЭМЕС',
    votingEndedDesc: lang === 'ru' ? 'Прием голосов по данной кампании официально окончен.' : 'Бул кампания боюнча добуштарды кабыл алуу расмий аяктады.',
    votingNotStartedDesc: lang === 'ru' ? 'Голосование еще не началось.' : 'Добуш берүү али баштала элек.',
    backToCabinet: lang === 'ru' ? 'В кабинет' : 'Кабинетке',
    votingActiveBadge: lang === 'ru' ? 'ГОЛОСОВАНИЕ ИДЕТ' : 'ДОБУШ БЕРҮҮ ЖҮРҮҮДӨ',
    privacyNote: lang === 'ru' ? 'Электронный бюллетень защищен. Выберите одного кандидата и подтвердите свой выбор.' : 'Электрондук бюллетень корголгон. Бир талапкерди тандап, тандооңузду тастыктаңыз.',
    candidatesList: (n: number) => lang === 'ru' ? `Список кандидатов (${n})` : `Талапкерлердин тизмеси (${n})`,
    selectedOne: lang === 'ru' ? '1 выбран' : '1 тандалды',
    selectCandidate: lang === 'ru' ? 'Выберите кандидата' : 'Талапкерди тандаңыз',
    candidateProfile: lang === 'ru' ? 'Анкета кандидата' : 'Талапкердин анкетасы',
    selected: lang === 'ru' ? 'Выбран' : 'Тандалды',
    select: lang === 'ru' ? 'Выбрать' : 'Тандоо',
    selectFromListPrompt: lang === 'ru' ? 'Выберите кандидата из списка выше для подачи голоса' : 'Добуш берүү үчүн жогорудагы тизмеден талапкерди тандаңыз',
    castVoteBtn: lang === 'ru' ? 'Подать голос' : 'Добуш берүү',
    candidateProgramTitle: (name: string) => lang === 'ru' ? `Программа кандидата: ${name}` : `Талапкердин программасы: ${name}`,
    shortBioLabel: lang === 'ru' ? 'Краткая биография' : 'Кыскача өмүр баяны',
    programLabel: lang === 'ru' ? 'Предвыборная программа' : 'Шайлоо алдындагы программасы',
    emptyBioProgram: lang === 'ru' ? 'Кандидат пока не заполнил биографию и предвыборную программу.' : 'Талапкер өмүр баянын жана программасын толтурган эмес.',
    closeBtn: lang === 'ru' ? 'Закрыть' : 'Жабуу',
    selectCandidateBtn: lang === 'ru' ? 'Выбрать кандидата' : 'Талапкерди тандоо',
    confirmTitle: lang === 'ru' ? 'Подтверждение голоса' : 'Добушту тастыктоо',
    confirmQuestion: lang === 'ru' ? 'Вы уверены в своем выборе?' : 'Тандооңузга ишенесизби?',
    confirmAboutTo: lang === 'ru' ? 'Вы собираетесь отдать электронный голос за кандидата:' : 'Сиз талапкерге электрондук добуш берип жатасыз:',
    confirmWarning: lang === 'ru' ? 'Внимание: согласно регламенту электронного голосования, изменить выбор после подтверждения невозможно.' : 'Көңүл буруңуз: электрондук добуш берүү регламентине ылайык, тастыктагандан кийин тандоону өзгөртүү мүмкүн эмес.',
    cancelBtn: lang === 'ru' ? 'Отмена' : 'Жокко чыгаруу',
    confirmBtn: lang === 'ru' ? 'Подтвердить' : 'Тастыктоо',
    sending: lang === 'ru' ? 'Отправка...' : 'Жөнөтүлүүдө...',
    voteError: lang === 'ru' ? 'Ошибка при записи голоса. Попробуйте еще раз.' : 'Добуш жазууда ката кетти. Кайра аракет кылыңыз.',
  };

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  const handleCastVote = async () => {
    if (!selectedCandidateId) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.castVote({
        election_id: electionId,
        candidate_id: selectedCandidateId
      });

      setIsConfirmOpen(false);
      setIsSuccess(true);
      setHasVoted(true);

      // Update cached election status
      try {
        const cachedElectionStr = sessionStorage.getItem(`cached_election_${electionId}`);
        if (cachedElectionStr) {
          const cachedElection = JSON.parse(cachedElectionStr);
          cachedElection.has_voted = true;
          sessionStorage.setItem(`cached_election_${electionId}`, JSON.stringify(cachedElection));
        }
      } catch (e) {}

      // Trigger Confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2566ff', '#1b57e6', '#eaf1ff', '#1f9d57']
        });
      } catch (e) {}
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(t.voteError);
      }
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] text-[14px]">
        {t.loadingBallot}
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-[var(--surface)] border border-[var(--line)] rounded-[20px] shadow-[var(--shadow-card)] space-y-4">
          <AlertCircle className="w-10 h-10 text-[var(--red)] mx-auto" />
          <h2 className="text-[20px] font-bold text-[var(--ink)]">{t.electionNotFound}</h2>
          <p className="text-[14px] text-[var(--muted)]">
            {t.electionNotFoundDesc}
          </p>
          <Link href="/vote/cabinet">
            <Button variant="primary">{t.toCabinet}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const electionTitle = lang === 'ky' && election.title_ky ? election.title_ky : election.title;
  const electionDesc = lang === 'ky' && election.description_ky ? election.description_ky : election.description;
  const uniName = lang === 'ky' && (election.university_name_ky || election.university_details?.name_ky)
    ? (election.university_name_ky || election.university_details?.name_ky)
    : (election.university_name || election.university_details?.name || student?.university?.name || '');

  // Check university match if student is loaded
  const getUniId = (objOrId: any) => {
    if (!objOrId) return '';
    if (typeof objOrId === 'string') return objOrId;
    return objOrId.id || objOrId.uuid || objOrId.pk || '';
  };

  const electionUniId = getUniId(election?.university) || getUniId(election?.university_details);
  const studentUniId = getUniId(student?.university) || getUniId(student?.university_details) || student?.university_id;
  const isDifferentUni = Boolean(electionUniId && studentUniId && String(electionUniId) !== String(studentUniId));

  if (isDifferentUni) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-[var(--surface)] border border-[var(--line)] rounded-[20px] shadow-[var(--shadow-card)] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--amber-bg)] text-[var(--amber)] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-[20px] font-bold text-[var(--ink)]">{t.notAvailableForUni}</h2>
          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            {t.notAvailableDesc(uniName || (lang === 'ky' ? 'башка университеттин' : 'другого университета'))}
          </p>
          <div className="pt-2">
            <Link href="/vote/cabinet">
              <Button variant="primary">{t.goToOwnCabinet}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if voting time expired
  const isTimeExpired = (election?.ends_at && new Date(election.ends_at) <= new Date()) || election?.status === 'finished';

  if (isTimeExpired) {
    const formattedEndTime = election.ends_at
      ? new Date(election.ends_at).toLocaleString(lang === 'ky' ? 'ky-KG' : 'ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-[var(--surface)] border border-[var(--line)] rounded-[22px] shadow-[var(--shadow-card)] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--red-bg)] text-[var(--red)] flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <Badge variant="red" dot={true}>
            {t.timeExpiredBadge}
          </Badge>
          <h1 className="text-[22px] sm:text-[24px] font-[800] text-[var(--ink)] tracking-tight">
            {t.timeExpiredTitle}
          </h1>
          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            {t.timeExpiredDesc(formattedEndTime)}
          </p>
          <div className="pt-2">
            <Link href="/vote/cabinet" className="block w-full">
              <Button variant="primary" className="w-full justify-center">
                {t.toCabinet}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State: Voted
  if (isSuccess || hasVoted) {
    return (
      <div className="min-h-screen bg-[var(--bg)] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8 sm:p-9 bg-[var(--surface)] border border-[var(--line)] rounded-[22px] shadow-[var(--shadow-modal)] space-y-5">
          <div className="w-16 h-16 rounded-full bg-[var(--green-bg)] text-[var(--green)] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <Badge variant="green" dot={true}>
              {t.badgeAccepted}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-[24px] font-[800] text-[var(--ink)] tracking-tight">
              {isSuccess ? t.voteAcceptedTitle : t.alreadyVotedTitle}
            </h1>
            <p className="text-[14px] text-[var(--muted)] leading-relaxed">
              {isSuccess ? t.voteAcceptedDesc : t.alreadyVotedDesc}
            </p>
          </div>

          <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] text-left text-[13px] text-[var(--muted)] space-y-2.5">
            <div className="flex justify-between">
              <span>{t.campaignLabel}</span>
              <span className="text-[var(--ink)] font-bold truncate max-w-[200px]">{electionTitle}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.ballotStatusLabel}</span>
              <span className="text-[var(--green)] font-bold">{t.ballotStatusVal}</span>
            </div>
            {votedAt && (
              <div className="flex justify-between">
                <span>{t.timeLabel}</span>
                <span className="text-[var(--ink)] font-mono">{new Date(votedAt).toLocaleString(lang === 'ky' ? 'ky-KG' : 'ru-RU')}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 border-t border-[var(--line)] text-[12px]">
              <span className="flex items-center gap-1 text-[var(--blue)]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t.secrecyLabel}
              </span>
              <span className="text-[var(--green)] font-semibold">{t.protectionVal}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/vote/cabinet" className="block w-full">
              <Button variant="primary" className="w-full justify-center">
                {t.returnToCabinet}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not active (not started yet)
  if (election.status !== 'active') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-[var(--surface)] border border-[var(--line)] rounded-[20px] shadow-[var(--shadow-card)] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <Badge variant="gray">
            {t.votingNotActive}
          </Badge>
          <h2 className="text-[20px] font-bold text-[var(--ink)]">{electionTitle}</h2>
          <p className="text-[14px] text-[var(--muted)]">
            {t.votingNotStartedDesc}
          </p>
          <Link href="/vote/cabinet">
            <Button variant="secondary">{t.toCabinet}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-32">
      {/* Top Header */}
      <header className="gtop w-full px-4 md:px-8 py-3.5 border-b border-[var(--line)] bg-[var(--surface)] sticky top-0 z-30">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <Link
            href="/vote/cabinet"
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToCabinet}</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="blue" dot={true}>
              {t.votingActiveBadge}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1000px] mx-auto px-3.5 sm:px-6 md:px-8 py-5 sm:py-8 space-y-4 sm:space-y-6">
        {/* Election Title Banner */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[18px] sm:rounded-[22px] p-4 sm:p-7 shadow-[var(--shadow-card)] space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--blue)] font-medium">
            <School className="w-4 h-4" />
            <span>{uniName}</span>
          </div>

          <h1 className="text-[20px] sm:text-[28px] font-[800] tracking-tight text-[var(--ink)] leading-snug">
            {electionTitle}
          </h1>

          {electionDesc && (
            <p className="text-[13.5px] sm:text-[14px] text-[var(--muted)] leading-relaxed">
              {electionDesc}
            </p>
          )}

          {/* Privacy Note */}
          <div className="pt-3.5 border-t border-[var(--line)] flex items-center gap-2 text-[12px] sm:text-[13px] text-[var(--muted)]">
            <ShieldCheck className="w-4 h-4 text-[var(--blue)] shrink-0" />
            <span>
              {t.privacyNote}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-[14px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[14px] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Candidates List Header */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-[17px] sm:text-[18px] font-[800] text-[var(--ink)]">
            {t.candidatesList(candidates.length)}
          </h2>
          <span className="text-[12.5px] sm:text-[13px] text-[var(--muted)]">
            {selectedCandidateId ? t.selectedOne : t.selectCandidate}
          </span>
        </div>

        {/* Candidates Cards */}
        <div className="space-y-3">
          {candidates.map((cand, idx) => {
            const isSelected = selectedCandidateId === cand.id;
            const candPosition = lang === 'ky' && cand.position_ky ? cand.position_ky : cand.position;

            return (
              <div
                key={cand.id}
                onClick={() => setSelectedCandidateId(cand.id)}
                className={`p-4 sm:p-6 rounded-[16px] sm:rounded-[18px] border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 ${
                  isSelected
                    ? 'bg-[var(--blue-soft)] border-[var(--blue)] ring-2 ring-[var(--blue)]/20 shadow-md'
                    : 'bg-[var(--surface)] border-[var(--line)] hover:border-[var(--blue)]/40 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4.5">
                  {/* Radio indicator */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 sm:mt-0 transition-colors ${
                      isSelected
                        ? 'border-[var(--blue)] bg-[var(--blue)] text-white'
                        : 'border-[var(--field-line)] bg-[var(--surface)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  {/* Candidate Avatar / Photo */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] overflow-hidden shrink-0 flex items-center justify-center text-[var(--blue)] font-bold text-[18px]">
                    {cand.photo || cand.photo_url ? (
                      <img
                        src={getMediaUrl(cand.photo || cand.photo_url)}
                        alt={cand.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `<span class="text-[var(--blue)] font-bold text-[16px]">${cand.full_name.slice(0, 2).toUpperCase()}</span>`;
                          }
                        }}
                      />
                    ) : (
                      cand.full_name.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  {/* Candidate Info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-mono font-semibold text-[var(--muted)] shrink-0">
                        #{idx + 1}
                      </span>
                      <h3 className="text-[16px] sm:text-[17px] font-bold text-[var(--ink)] truncate">
                        {cand.full_name}
                      </h3>
                    </div>

                    {candPosition && (
                      <div className="text-[12.5px] sm:text-[13px] text-[var(--blue)] font-medium">
                        {candPosition}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right actions: View profile link + Select button */}
                <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2.5 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[var(--line)]">
                  <Link
                    href={`/vote/elections/${election.id}/candidate/${cand.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--blue)] hover:underline px-2.5 py-1.5 rounded-[9px] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t.candidateProfile}</span>
                  </Link>

                  <span
                    className={`text-[13px] font-semibold px-3.5 py-1.5 rounded-[10px] transition-all ${
                      isSelected
                        ? 'bg-[var(--blue)] text-white shadow-sm'
                        : 'bg-[var(--surface-2)] text-[var(--muted)]'
                    }`}
                  >
                    {isSelected ? t.selected : t.select}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Voting Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface)] border-t border-[var(--line)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40">
        <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[13.5px] text-[var(--muted)] text-center sm:text-left">
            {selectedCandidate ? (
              <span>
                {lang === 'ru' ? 'Ваш текущий выбор: ' : 'Учурдагы тандооңуз: '}
                <strong className="text-[var(--ink)]">{selectedCandidate.full_name}</strong>
              </span>
            ) : (
              <span>{t.selectFromListPrompt}</span>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={!selectedCandidateId}
            onClick={() => setIsConfirmOpen(true)}
            className="w-full sm:w-auto gap-2 shadow-[var(--shadow-blue-btn)]"
          >
            <span>{t.castVoteBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>

      {/* Candidate Biography / Program Modal */}
      <Modal
        isOpen={Boolean(programModalCandidate)}
        onClose={() => setProgramModalCandidate(null)}
        title={t.candidateProgramTitle(programModalCandidate?.full_name || '')}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)]">
            <div className="w-12 h-12 rounded-[12px] bg-[var(--surface)] flex items-center justify-center font-bold text-[var(--blue)] shrink-0 overflow-hidden">
              {programModalCandidate?.photo_url || programModalCandidate?.photo ? (
                <img
                  src={getMediaUrl(programModalCandidate.photo || programModalCandidate.photo_url)}
                  alt={programModalCandidate.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                programModalCandidate?.full_name?.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h4 className="font-bold text-[16px] text-[var(--ink)]">
                {programModalCandidate?.full_name}
              </h4>
              {(programModalCandidate?.position_ky || programModalCandidate?.position) && (
                <p className="text-[13px] text-[var(--blue)] font-medium">
                  {lang === 'ky' && programModalCandidate?.position_ky ? programModalCandidate.position_ky : programModalCandidate.position}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-[14px] text-[var(--ink)] leading-relaxed">
            {(programModalCandidate?.short_bio_ky || programModalCandidate?.short_bio) && (
              <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] space-y-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {t.shortBioLabel}
                </span>
                <p className="text-[13.5px] text-[var(--ink)] whitespace-pre-wrap">
                  {lang === 'ky' && programModalCandidate.short_bio_ky ? programModalCandidate.short_bio_ky : programModalCandidate.short_bio}
                </p>
              </div>
            )}

            {(programModalCandidate?.program_ky || programModalCandidate?.program) && (
              <div className="p-3.5 rounded-[12px] bg-[var(--blue-soft)] border border-[var(--blue)]/20 space-y-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--blue)]">
                  {t.programLabel}
                </span>
                <p className="text-[13.5px] text-[var(--ink)] whitespace-pre-wrap">
                  {lang === 'ky' && programModalCandidate.program_ky ? programModalCandidate.program_ky : programModalCandidate.program}
                </p>
              </div>
            )}

            {!programModalCandidate?.short_bio && !programModalCandidate?.short_bio_ky && !programModalCandidate?.program && !programModalCandidate?.program_ky && (
              <p className="text-[13.5px] text-[var(--muted)] italic text-center py-4">
                {t.emptyBioProgram}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setProgramModalCandidate(null)}
            >
              {t.closeBtn}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedCandidateId(programModalCandidate.id);
                setProgramModalCandidate(null);
              }}
            >
              {t.selectCandidateBtn}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => !isSubmitting && setIsConfirmOpen(false)}
        title={t.confirmTitle}
        maxWidth="sm"
      >
        <div className="space-y-5 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-[var(--blue-bg)] text-[var(--blue)] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h4 className="text-[18px] font-bold text-[var(--ink)]">
              {t.confirmQuestion}
            </h4>
            <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
              {t.confirmAboutTo}
            </p>
            <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] font-bold text-[16px] text-[var(--ink)]">
              {selectedCandidate?.full_name}
            </div>
          </div>

          <p className="text-[12px] text-[var(--muted)] bg-[var(--amber-bg)] text-[var(--amber)] p-3 rounded-[10px] text-left">
            {t.confirmWarning}
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1 justify-center"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              {t.cancelBtn}
            </Button>
            <Button
              variant="primary"
              className="flex-1 justify-center shadow-[var(--shadow-blue-btn)]"
              onClick={handleCastVote}
              disabled={isSubmitting}
            >
              {isSubmitting ? t.sending : t.confirmBtn}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
