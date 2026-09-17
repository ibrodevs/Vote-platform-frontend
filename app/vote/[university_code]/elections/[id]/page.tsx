'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Shield, Check, User, BookOpen, CheckCircle2,
  AlertCircle, ArrowRight, Lock, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, ApiError } from '@/lib/api';
import { translations, Language } from '@/lib/i18n';

export default function ElectionBallotPage() {
  const params = useParams();
  const router = useRouter();

  const uniCode = String(params.university_code || '').toLowerCase();
  const electionId = String(params.id || '');

  const [lang, setLang] = useState<Language>('ru');
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
    const currentLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(currentLang);

    const token = sessionStorage.getItem('student_token');
    if (!token) {
      router.push(`/vote/${uniCode}/login`);
      return;
    }

    // 1. Check voting status first
    api.getVotingStatus(electionId)
      .then(res => {
        if (res.has_voted) {
          setHasVoted(true);
          setVotedAt(res.voted_at || null);
        }
      })
      .catch(err => console.error('Status check error', err));

    // 2. Fetch election details & candidates
    Promise.all([
      api.getElectionDetail(electionId),
      api.getElectionCandidates(electionId)
    ])
      .then(([electionData, candidatesData]) => {
        setElection(electionData);
        setCandidates(candidatesData || electionData.candidates || []);
      })
      .catch(err => {
        console.error('Failed to load election or candidates', err);
        setErrorMsg('Не удалось загрузить данные выборов');
      })
      .finally(() => setIsLoading(false));
  }, [uniCode, electionId, router]);

  const t = translations[lang];
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

      // Close confirmation dialog and show success state
      setIsConfirmOpen(false);
      setIsSuccess(true);
      setHasVoted(true);

      // Royal Blue CRM Confetti
      try {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#2566ff', '#1b57e6', '#eaf1ff', '#1f9d57']
        });
      } catch (e) {}
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(lang === 'ru' ? 'Ошибка при записи голоса' : 'Добуш жазууда ката чыкты');
      }
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] text-[14px]">
        Загрузка электронного бюллетеня...
      </div>
    );
  }

  // State A: Already Voted / Success Screen
  if (isSuccess || hasVoted) {
    return (
      <div className="min-h-screen bg-[var(--bg)] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8 sm:p-9 crm-card shadow-[var(--shadow-modal)]">
          <div className="w-14 h-14 rounded-full bg-[var(--green-bg)] text-[var(--green)] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="mb-4">
            <Badge variant="green" dot={true}>
              {t.receipt_tag}
            </Badge>
          </div>

          <h1 className="text-[24px] sm:text-[26px] font-[800] text-[var(--ink)] tracking-tight mb-2">
            {isSuccess ? t.success_title : t.already_voted_title}
          </h1>

          <p className="text-[14px] text-[var(--muted)] leading-relaxed mb-6">
            {isSuccess ? t.success_subtitle : t.already_voted_desc}
          </p>

          <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-left text-[13px] text-[var(--muted)] space-y-2.5 mb-6">
            <div className="flex justify-between">
              <span>Кампания:</span>
              <span className="text-[var(--ink)] font-bold truncate max-w-[200px]">{election?.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Статус бюллетеня:</span>
              <span className="text-[var(--green)] font-bold">ПРИНЯТ (ОБЕЗЛИЧЕН)</span>
            </div>
            {votedAt && (
              <div className="flex justify-between">
                <span>Время фиксации:</span>
                <span className="text-[var(--ink)] font-mono">{new Date(votedAt).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          <Link href={`/vote/${uniCode}/elections`}>
            <Button variant="primary" size="md" className="w-full justify-center">
              {t.back_to_elections}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-10 md:py-16 pb-32 text-[var(--body)]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/vote/${uniCode}/elections`}
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back_to_elections}</span>
          </Link>
          <Badge variant="blue">
            ЭЛЕКТРОННЫЙ БЮЛЛЕТЕНЬ
          </Badge>
        </div>

        {/* Header Block */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-[28px] sm:text-[34px] font-[800] text-[var(--ink)] tracking-tight mb-2">
            {lang === 'ky' && election?.title_ky ? election.title_ky : election?.title}
          </h1>
          <p className="text-[14px] text-[var(--muted)] leading-relaxed mb-4">
            {lang === 'ky' && election?.description_ky ? election.description_ky : election?.description}
          </p>

          <div className="inline-flex items-center gap-2.5 p-3 rounded-[12px] bg-[var(--surface)] border border-[var(--line)] text-[13px] text-[var(--muted)] shadow-sm">
            <Shield className="w-4 h-4 text-[var(--blue)] shrink-0" />
            <span>{t.ballot_note}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2 max-w-2xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Candidate Cards Grid */}
        <div className="mb-12">
          <span className="text-[12px] uppercase tracking-wider text-[var(--muted)] block mb-4 font-bold">
            {t.choose_candidate}
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((cand) => {
              const isSelected = selectedCandidateId === cand.id;

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  className={`relative rounded-[16px] p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--surface)] border-[var(--blue)] ring-2 ring-[var(--blue)]/25 shadow-[var(--shadow-pop)]'
                      : 'bg-[var(--surface)] border-[var(--line)] shadow-[var(--shadow-card)] hover:border-[var(--line-strong)]'
                  }`}
                >
                  {/* Selection Indicator */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-[var(--line)] bg-[var(--surface-2)] shrink-0 shadow-sm">
                      {cand.photo_url || cand.photo ? (
                        <img
                          src={cand.photo_url || cand.photo}
                          alt={cand.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                          <User className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[var(--blue)] border-[var(--blue)] text-white shadow-sm'
                          : 'border-[var(--field-line)] bg-[var(--surface-2)]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Candidate Details */}
                  <div className="mb-5">
                    <h3 className="text-[18px] font-bold text-[var(--ink)] mb-1">
                      {cand.full_name}
                    </h3>
                    <p className="text-[13.5px] text-[var(--blue)] font-bold mb-1">
                      {cand.position}
                    </p>
                    <p className="text-[13px] text-[var(--muted)]">
                      {cand.faculty} • {cand.course} курс
                    </p>

                    {cand.short_bio && (
                      <p className="text-[13px] text-[var(--muted)] mt-2.5 line-clamp-3 leading-relaxed">
                        {cand.short_bio}
                      </p>
                    )}
                  </div>

                  {/* Manifesto action link */}
                  <div className="pt-3.5 border-t border-[var(--line)] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProgramModalCandidate(cand);
                      }}
                      className="text-[13px] text-[var(--muted)] hover:text-[var(--blue)] flex items-center gap-1.5 cursor-pointer font-medium"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[var(--blue)]" />
                      <span>{t.view_program}</span>
                    </button>

                    <span className={`text-[12px] font-bold ${isSelected ? 'text-[var(--blue)]' : 'text-[var(--muted-2)]'}`}>
                      {isSelected ? 'ВЫБРАН' : 'ВЫБРАТЬ'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-[var(--surface)]/90 backdrop-blur-md border-t border-[var(--line)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3.5">
          <div className="text-[14px] text-[var(--muted)]">
            {selectedCandidate ? (
              <span>
                {t.candidate_chosen}: <strong className="text-[var(--ink)] ml-1 font-bold">{selectedCandidate.full_name}</strong>
              </span>
            ) : (
              <span>{t.select_required}</span>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            disabled={!selectedCandidateId}
            onClick={() => setIsConfirmOpen(true)}
            className="w-full sm:w-auto px-7 justify-center"
          >
            {t.proceed_to_confirm}
          </Button>
        </div>
      </div>

      {/* 1. Candidate Manifesto Modal: 22px radius */}
      <Modal
        isOpen={!!programModalCandidate}
        onClose={() => setProgramModalCandidate(null)}
        title={programModalCandidate ? `Программа: ${programModalCandidate.full_name}` : 'Программа'}
        maxWidth="lg"
      >
        {programModalCandidate && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--line)]">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[var(--line)] bg-[var(--surface-2)] shrink-0 shadow-sm">
                {programModalCandidate.photo_url || programModalCandidate.photo ? (
                  <img src={programModalCandidate.photo_url || programModalCandidate.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-3 text-[var(--muted)]" />
                )}
              </div>
              <div>
                <h4 className="text-[18px] font-bold text-[var(--ink)]">
                  {programModalCandidate.full_name}
                </h4>
                <p className="text-[13.5px] text-[var(--blue)] font-bold">
                  {programModalCandidate.position} • {programModalCandidate.faculty}
                </p>
              </div>
            </div>

            <div className="text-[14px] text-[var(--body)] leading-relaxed whitespace-pre-wrap">
              {programModalCandidate.program || 'Текст предвыборной программы уточняется.'}
            </div>

            <div className="pt-5 flex justify-end border-t border-[var(--line)]">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedCandidateId(programModalCandidate.id);
                  setProgramModalCandidate(null);
                }}
              >
                Выбрать этого кандидата
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Vote Confirmation Modal: 22px radius */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={t.confirm_title}
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[12px] bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[var(--muted)] uppercase">{t.candidate_chosen}</p>
              <h4 className="text-[17px] font-bold text-[var(--ink)]">
                {selectedCandidate?.full_name}
              </h4>
            </div>
          </div>

          <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
            {t.anonymous_notice}
          </p>

          <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-[13px] text-[var(--ink)] font-mono">
            ✓ Физическая гарантия: таблица Ballot не содержит student_id
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              {t.back_to_ballot}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              onClick={handleCastVote}
            >
              {isSubmitting ? t.submitting_vote : t.confirm_submit_btn}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
