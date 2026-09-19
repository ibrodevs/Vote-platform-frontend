'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, School, BookOpen,
  User, CheckCircle2, ShieldCheck, Vote, AlertCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, getMediaUrl } from '@/lib/api';

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const electionId = String(params.id || '');
  const candidateId = String(params.candidateId || '');

  const [lang, setLang] = useState<'ru' | 'ky'>('ru');
  const [candidate, setCandidate] = useState<any>(null);
  const [election, setElection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [imgError, setImgError] = useState<boolean>(false);

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
    let hasCachedData = false;

    if (typeof window !== 'undefined') {
      const studentToken = sessionStorage.getItem('student_token');
      setIsStudentLoggedIn(Boolean(studentToken));

      // 1. Fast path from cached election
      const cachedElectionStr = sessionStorage.getItem(`cached_election_${electionId}`);
      if (cachedElectionStr) {
        try {
          const cachedElection = JSON.parse(cachedElectionStr);
          setElection(cachedElection);
          if (cachedElection.has_voted) {
            setHasVoted(true);
          }
          const found = cachedElection.candidates?.find((c: any) => c.id === candidateId);
          if (found) {
            setCandidate(found);
            hasCachedData = true;
          }
        } catch (e) {}
      }

      // 2. Fast path from cached candidate
      const cachedCandStr = sessionStorage.getItem(`cached_candidate_${candidateId}`);
      if (cachedCandStr) {
        try {
          const cachedCand = JSON.parse(cachedCandStr);
          setCandidate(cachedCand);
          hasCachedData = true;
        } catch (e) {}
      }
    }

    if (hasCachedData) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // Background fetch to ensure fresh data without blocking UI
    Promise.all([
      api.getCandidateDetails(candidateId).catch(() => null),
      api.getElectionDetail(electionId).catch(() => null),
      api.getVotingStatus(electionId).catch(() => null)
    ])
      .then(([candRes, elecRes, statusRes]) => {
        if (elecRes) {
          setElection(elecRes);
          try {
            sessionStorage.setItem(`cached_election_${electionId}`, JSON.stringify(elecRes));
          } catch (e) {}
        }

        if (candRes) {
          setCandidate(candRes);
          try {
            sessionStorage.setItem(`cached_candidate_${candidateId}`, JSON.stringify(candRes));
          } catch (e) {}
        } else if (elecRes && Array.isArray(elecRes.candidates)) {
          const found = elecRes.candidates.find((c: any) => c.id === candidateId);
          if (found) {
            setCandidate(found);
            try {
              sessionStorage.setItem(`cached_candidate_${candidateId}`, JSON.stringify(found));
            } catch (e) {}
          } else if (!hasCachedData) {
            setErrorMsg(lang === 'ru' ? 'Кандидат не найден' : 'Талапкер табылган жок');
          }
        } else if (!hasCachedData) {
          setErrorMsg(lang === 'ru' ? 'Кандидат не найден' : 'Талапкер табылган жок');
        }

        if (statusRes?.has_voted || elecRes?.has_voted) {
          setHasVoted(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load candidate details', err);
        if (!hasCachedData) {
          setErrorMsg(lang === 'ru' ? 'Ошибка при загрузке анкеты кандидата' : 'Талапкердин анкетасын жүктөөдө ката кетти');
        }
      })
      .finally(() => setIsLoading(false));
  }, [electionId, candidateId, lang]);

  const t = {
    loading: lang === 'ru' ? 'Загрузка анкеты кандидата...' : 'Талапкердин анкетасы жүктөлүүдө...',
    pleaseWait: lang === 'ru' ? 'Пожалуйста, подождите' : 'Сураныч, күтө туруңуз',
    notFoundTitle: lang === 'ru' ? 'Анкета не найдена' : 'Анкета табылган жок',
    notFoundDesc: lang === 'ru' ? 'Запрошенный кандидат не существует или был удален.' : 'Суралган талапкер жок же өчүрүлгөн.',
    backToVote: lang === 'ru' ? 'Вернуться к голосованию' : 'Добуш берүүгө кайтуу',
    backToBallot: lang === 'ru' ? 'Назад к бюллетеню' : 'Бюллетенге кайтуу',
    back: lang === 'ru' ? 'Назад' : 'Артка',
    candidateBadge: lang === 'ru' ? 'АНКЕТА КАНДИДАТА' : 'ТАЛАПКЕРДИН АНКЕТАСЫ',
    ballotNumber: (n: number) => lang === 'ru' ? `Номер в бюллетене: #${n}` : `Бюллетендеги номери: #${n}`,
    defaultPosition: lang === 'ru' ? 'Кандидат' : 'Талапкер',
    alreadyVotedAlert: lang === 'ru' ? 'Ваш голос в этих выборах уже зафиксирован' : 'Бул шайлоодогу сиздин добушуңуз буга чейин катталган',
    voteForCandidate: lang === 'ru' ? 'Проголосовать за кандидата' : 'Талапкерге добуш берүү',
    toCandidatesList: lang === 'ru' ? 'К списку кандидатов' : 'Талапкерлердин тизмесине',
    shortBioTitle: lang === 'ru' ? 'Краткая биография' : 'Кыскача өмүр баяны',
    emptyBio: lang === 'ru' ? 'Краткая биография не заполнена кандидатом.' : 'Кыскача өмүр баяны талапкер тарабынан толтурулган эмес.',
    programTitle: lang === 'ru' ? 'Предвыборная программа' : 'Шайлоо алдындагы программасы',
    emptyProgram: lang === 'ru' ? 'Предвыборная программа не заполнена кандидатом.' : 'Шайлоо алдындагы программа талапкер тарабынан толтурулган эмес.',
    secrecyNotice: lang === 'ru'
      ? 'Голосование в платформе Dobush.kg является полностью тайным и анонимным. Информация о вашем голосе физически отделена от персонального аккаунта студента.'
      : 'Dobush.kg платформасында добуш берүү толугу менен жашыруун жана анонимдүү. Сиздин добушуңуз тууралуу маалымат студенттин жеке аккаунтунан физикалык жактан бөлүнгөн.',
    bottomCandidateLabel: lang === 'ru' ? 'Кандидат' : 'Талапкер',
    bottomBallotBtn: lang === 'ru' ? 'Бюллетень' : 'Бюллетень',
    voteAlreadyAccepted: lang === 'ru' ? 'Голос уже принят' : 'Добуш кабыл алынган',
    voteActionBtn: lang === 'ru' ? 'Проголосовать' : 'Добуш берүү',
    confirmTitle: lang === 'ru' ? 'Подтверждение выбора' : 'Тандоону тастыктоо',
    confirmText: (name: string) => lang === 'ru'
      ? <>Вы отдаете свой голос за кандидата <strong className="text-[var(--blue)] font-bold">{name}</strong>.</>
      : <>Сиз талапкер <strong className="text-[var(--blue)] font-bold">{name}</strong> үчүн добуш берип жатасыз.</>,
    confirmPoint1: lang === 'ru' ? '• Ваш выбор будет зашифрован и записан в протокол.' : '• Тандооңуз шифрленип, протоколго жазылат.',
    confirmPoint2: lang === 'ru' ? '• Изменить решение после подтверждения невозможно.' : '• Тастыктагандан кийин чечимди өзгөртүү мүмкүн эмес.',
    cancelBtn: lang === 'ru' ? 'Отмена' : 'Жокко чыгаруу',
    confirmVoteBtn: lang === 'ru' ? 'Подтвердить голос' : 'Добушту тастыктоо',
    successTitle: lang === 'ru' ? 'Голос успешно принят!' : 'Добуш ийгиликтүү кабыл алынды!',
    thanksForVoting: lang === 'ru' ? 'Спасибо за участие!' : 'Катышканыңыз үчүн рахмат!',
    successDesc: (name: string) => lang === 'ru'
      ? <>Ваш голос за кандидата <strong className="text-[var(--ink)]">{name}</strong> успешно зарегистрирован в реестре.</>
      : <>Талапкер <strong className="text-[var(--ink)]">{name}</strong> үчүн добушуңуз реестрде ийгиликтүү катталды.</>,
    returnToBallot: lang === 'ru' ? 'Вернуться к бюллетеню' : 'Бюллетенге кайтуу',
    voteErrorMsg: lang === 'ru' ? 'Ошибка при фиксации голоса. Попробуйте еще раз.' : 'Добуш жазууда ката кетти. Кайра аракет кылыңыз.',
  };

  const handleVoteClick = () => {
    if (!isStudentLoggedIn) {
      router.push(`/vote/auth?election=${electionId}`);
      return;
    }
    if (hasVoted) return;
    setIsConfirmOpen(true);
  };

  const handleCastVote = async () => {
    if (!candidateId || !electionId) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.castVote({
        election_id: electionId,
        candidate_id: candidateId
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
      setErrorMsg(err.message || t.voteErrorMsg);
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="crm-card p-10 text-center max-w-sm w-full">
          <div className="w-10 h-10 border-3 border-[var(--blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[15px] font-bold text-[var(--ink)]">{t.loading}</p>
          <p className="text-[13px] text-[var(--muted)] mt-1">{t.pleaseWait}</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !candidate) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="crm-card p-8 sm:p-10 text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-[14px] bg-[var(--red-bg)] text-[var(--red)] flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-[20px] font-bold text-[var(--ink)] mb-2">{t.notFoundTitle}</h2>
          <p className="text-[14px] text-[var(--muted)] mb-6">
            {errorMsg || t.notFoundDesc}
          </p>
          <Link href={`/vote/elections/${electionId}`}>
            <Button variant="primary" className="w-full justify-center">
              {t.backToVote}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getUniId = (objOrId: any) => {
    if (!objOrId) return '';
    if (typeof objOrId === 'string') return objOrId;
    return objOrId.id || objOrId.uuid || objOrId.pk || '';
  };

  const studentDataStr = typeof window !== 'undefined' ? sessionStorage.getItem('student_data') : null;
  const student = studentDataStr ? JSON.parse(studentDataStr) : null;
  const electionUniId = getUniId(election?.university) || getUniId(election?.university_details) || getUniId(candidate?.university);
  const studentUniId = getUniId(student?.university) || getUniId(student?.university_details) || student?.university_id;
  const isDifferentUni = Boolean(electionUniId && studentUniId && String(electionUniId) !== String(studentUniId));

  if (isDifferentUni) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-[var(--surface)] border border-[var(--line)] rounded-[20px] shadow-[var(--shadow-card)] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--amber-bg)] text-[var(--amber)] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-[20px] font-bold text-[var(--ink)]">
            {lang === 'ru' ? 'Недоступно для вашего университета' : 'Сиздин университетиңиз үчүн жеткиликтүү эмес'}
          </h2>
          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            {lang === 'ru'
              ? 'Данный кандидат баллотируется на выборах другого университета. Голосование доступно только студентам этого учебного заведения.'
              : 'Бул талапкер башка университеттин шайлоосуна катышууда. Добуш берүү ошол окуу жайынын студенттерине гана жеткиликтүү.'}
          </p>
          <div className="pt-2">
            <Link href="/vote/cabinet">
              <Button variant="primary">
                {lang === 'ru' ? 'В личный кабинет' : 'Жеке кабинетке'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isTimeExpired = (election?.ends_at && new Date(election.ends_at) <= new Date()) || election?.status === 'finished';

  const photoSrc = !imgError && (candidate?.photo || candidate?.photo_url)
    ? getMediaUrl(candidate.photo || candidate.photo_url)
    : null;

  const candPosition = lang === 'ky' && candidate?.position_ky ? candidate.position_ky : (candidate?.position || t.defaultPosition);
  const candBio = lang === 'ky' && candidate?.short_bio_ky ? candidate.short_bio_ky : candidate?.short_bio;
  const candProgram = lang === 'ky' && candidate?.program_ky ? candidate.program_ky : candidate?.program;
  const electionTitle = lang === 'ky' && (candidate?.election_title_ky || election?.title_ky)
    ? (candidate?.election_title_ky || election?.title_ky)
    : (candidate?.election_title || election?.title);
  const uniName = lang === 'ky' && (candidate?.university_name_ky || election?.university_name_ky || election?.university_details?.name_ky)
    ? (candidate?.university_name_ky || election?.university_name_ky || election?.university_details?.name_ky)
    : (candidate?.university_name || election?.university_name || election?.university_details?.name);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-28 sm:pb-36">
      {/* Top Sticky Header */}
      <header className="gtop w-full px-4 sm:px-8 py-3.5 border-b border-[var(--line)] bg-[var(--surface)] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[900px] mx-auto flex items-center justify-between gap-3">
          <Link
            href={`/vote/elections/${electionId}`}
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">{t.backToBallot}</span>
            <span className="sm:hidden">{t.back}</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="blue" dot={true}>
              {t.candidateBadge}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-[900px] mx-auto px-4 sm:px-8 pt-6 sm:pt-10 space-y-6">
        {/* Expired banner if voting closed */}
        {isTimeExpired && (
          <div className="p-4 rounded-[14px] bg-[var(--red-bg)] border border-[var(--red)]/25 text-[var(--red)] text-[14px] flex items-center gap-3">
            <Clock className="w-5 h-5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold block">
                {lang === 'ru' ? 'Время голосования истекло' : 'Добуш берүү убактысы аяктады'}
              </span>
              <span className="text-[13px] opacity-90 block">
                {lang === 'ru'
                  ? 'Прием голосов по данной кампании официально окончен. Голосование за кандидата недоступно.'
                  : 'Бул кампания боюнча добуштарды кабыл алуу расмий аяктады. Талапкерге добуш берүү жеткиликсиз.'}
              </span>
            </div>
          </div>
        )}

        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="p-4 rounded-[14px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[14px] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Candidate Profile Hero Card */}
        <div className="crm-card p-6 sm:p-9">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
            {/* Candidate Photo / Big Avatar without badge */}
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
            </div>

            {/* Candidate Identity Details */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge variant="blue">
                  {candPosition}
                </Badge>
                {candidate.order !== undefined && (
                  <Badge variant="gray">
                    {t.ballotNumber(candidate.order + 1)}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-[800] text-[var(--ink)] tracking-tight leading-tight">
                {candidate.full_name}
              </h1>

              {/* University & Election context */}
              <div className="flex flex-col gap-1 text-[13.5px] text-[var(--muted)]">
                {electionTitle && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 font-medium text-[var(--ink)]">
                    <Vote className="w-4 h-4 text-[var(--blue)] shrink-0" />
                    <span className="truncate">{electionTitle}</span>
                  </div>
                )}
                {uniName && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <School className="w-4 h-4 text-[var(--muted)] shrink-0" />
                    <span className="truncate">{uniName}</span>
                  </div>
                )}
              </div>

              {/* Action Button: Vote directly for candidate */}
              <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {hasVoted ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[var(--green-bg)] text-[var(--green)] border border-[var(--green)]/25 text-[13.5px] font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t.alreadyVotedAlert}</span>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleVoteClick}
                    className="gap-2 shadow-[var(--shadow-blue-btn)]"
                  >
                    <Vote className="w-4 h-4" />
                    <span>{t.voteForCandidate}</span>
                  </Button>
                )}

                <Link href={`/vote/elections/${electionId}`}>
                  <Button variant="secondary" size="lg">
                    {t.toCandidatesList}
                  </Button>
                </Link>
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
              {t.shortBioTitle}
            </h2>
          </div>

          <div className="text-[14.5px] sm:text-[15px] text-[var(--body)] leading-relaxed pt-1 whitespace-pre-wrap">
            {candBio ? (
              candBio
            ) : (
              <span className="text-[var(--muted)] italic">{t.emptyBio}</span>
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
              {t.programTitle}
            </h2>
          </div>

          <div className="text-[14.5px] sm:text-[15px] text-[var(--body)] leading-relaxed pt-1 whitespace-pre-wrap">
            {candProgram ? (
              candProgram
            ) : (
              <span className="text-[var(--muted)] italic">{t.emptyProgram}</span>
            )}
          </div>
        </div>

        {/* Guarantee of Anonymity Note */}
        <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] flex items-start gap-3 text-[13px] text-[var(--muted)]">
          <ShieldCheck className="w-5 h-5 text-[var(--blue)] shrink-0 mt-0.5" />
          <p>
            {t.secrecyNotice}
          </p>
        </div>
      </main>

      {/* Floating Bottom Bar for Mobile & Desktop */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40">
        <div className="max-w-[900px] mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0 hidden sm:block">
            <p className="text-[12px] uppercase tracking-wider text-[var(--muted)] font-bold">
              {t.bottomCandidateLabel}
            </p>
            <p className="text-[15px] font-bold text-[var(--ink)] truncate">
              {candidate.full_name}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link href={`/vote/elections/${electionId}`} className="hidden sm:inline-block">
              <Button variant="secondary" size="lg">
                {t.bottomBallotBtn}
              </Button>
            </Link>

            {hasVoted ? (
              <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[12px] bg-[var(--green-bg)] text-[var(--green)] border border-[var(--green)]/25 text-[14px] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.voteAlreadyAccepted}</span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleVoteClick}
                className="w-full sm:w-auto gap-2 shadow-[var(--shadow-blue-btn)] justify-center"
              >
                <Vote className="w-4 h-4" />
                <span>{t.voteActionBtn}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => !isSubmitting && setIsConfirmOpen(false)}
        title={t.confirmTitle}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-[14.5px] text-[var(--ink)] leading-relaxed">
            {t.confirmText(candidate?.full_name)}
          </p>
          <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-[12.5px] text-[var(--muted)] space-y-1">
            <p>{t.confirmPoint1}</p>
            <p>{t.confirmPoint2}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
              className="flex-1 justify-center"
            >
              {t.cancelBtn}
            </Button>
            <Button
              variant="primary"
              onClick={handleCastVote}
              isLoading={isSubmitting}
              className="flex-1 justify-center shadow-[var(--shadow-blue-btn)]"
            >
              {t.confirmVoteBtn}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccess}
        onClose={() => router.push(`/vote/elections/${electionId}`)}
        title={t.successTitle}
        maxWidth="sm"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-[var(--green-bg)] text-[var(--green)] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[18px] font-bold text-[var(--ink)]">
              {t.thanksForVoting}
            </h3>
            <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
              {t.successDesc(candidate?.full_name)}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => router.push(`/vote/elections/${electionId}`)}
              className="w-full justify-center shadow-[var(--shadow-blue-btn)]"
            >
              {t.returnToBallot}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
