'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Vote, ShieldCheck, RefreshCw, CheckSquare,
  ArrowLeft, AlertCircle, Trophy, Sparkles, TrendingUp,
  Flame, Award, School, User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, getMediaUrl } from '@/lib/api';

export default function ElectionTurnoutPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = String(params.id || '');

  const [turnout, setTurnout] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [highlightedCandidateId, setHighlightedCandidateId] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  const prevVotesMapRef = useRef<{ [id: string]: number }>({});

  const fetchTurnout = () => {
    api.getElectionTurnout(electionId)
      .then(data => {
        setTurnout(data);
        setLastUpdated(new Date());

        const incomingCandidates = Array.isArray(data.candidates) ? data.candidates : [];

        // Check if any candidate's vote count increased
        let updatedId: string | null = null;
        incomingCandidates.forEach((cand: any) => {
          const prev = prevVotesMapRef.current[cand.candidate_id];
          if (prev !== undefined && cand.votes > prev) {
            updatedId = cand.candidate_id;
          }
          prevVotesMapRef.current[cand.candidate_id] = cand.votes;
        });

        if (updatedId) {
          setHighlightedCandidateId(updatedId);
          setTimeout(() => setHighlightedCandidateId(null), 1800);
        }

        // Sort descending by votes
        const sorted = [...incomingCandidates].sort((a, b) => b.votes - a.votes);
        setCandidates(sorted);
      })
      .catch(err => console.error('Turnout fetch error', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      try {
        setAdminUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    fetchTurnout();

    // Poll every 2.5 seconds for live telemetry & dynamic voting
    const timer = setInterval(fetchTurnout, 2500);
    return () => clearInterval(timer);
  }, [electionId, router]);

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [finishError, setFinishError] = useState('');

  const handleFinishElection = () => {
    setIsFinishModalOpen(true);
    setFinishError('');
  };

  const confirmFinishElection = async () => {
    setIsFinishing(true);
    setFinishError('');
    try {
      await api.finishElection(electionId);
      router.push(`/admin/elections/${electionId}/results`);
    } catch (err: any) {
      setFinishError(err.message || 'Ошибка сервера при завершении выборов');
      setIsFinishing(false);
    }
  };



  if (isLoading) {
    return (
      <div className="p-12 text-center text-[var(--muted)] crm-card">
        <RefreshCw className="w-7 h-7 animate-spin text-[var(--blue)] mx-auto mb-3" />
        <p className="text-[16px] font-bold text-[var(--ink)]">Подключение к телеметрии явки...</p>
        <p className="text-[13px] text-[var(--muted)] mt-1">Опрос сервера явки в режиме реального времени</p>
      </div>
    );
  }

  const leader = candidates.length > 0 ? candidates[0] : null;
  const isObserver = adminUser?.role === 'observer';

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto pb-12">
      {/* Top return & live indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/elections"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться к списку выборов</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="blue" dot={true}>
            LIVE POLLING (2.5S)
          </Badge>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--green-bg)] text-[var(--green)] border border-[var(--green)]/20 text-[11.5px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-ping" />
            В эфире
          </span>
        </div>
      </div>

      {/* Title Block with Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h1 className="text-[26px] sm:text-[32px] font-[800] tracking-[-0.025em] text-[var(--ink)]">
              {turnout?.election_title || 'Мониторинг явки избирателей'}
            </h1>
            <Badge variant="green" dot={true}>
              ГОЛОСОВАНИЕ ИДЕТ
            </Badge>
          </div>
          <p className="text-[13.5px] sm:text-[14px] text-[var(--muted)]">
            Обновлено: {lastUpdated.toLocaleTimeString()} • Телеметрия опрашивается в реальном времени
          </p>
        </div>

        {!isObserver && (
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={handleFinishElection}
              isLoading={isFinishing}
              className="gap-2 shrink-0 shadow-[var(--shadow-blue-btn)] flex-1 md:flex-none justify-center"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Завершить выборы</span>
            </Button>
          </div>
        )}
      </div>

      {/* Big Metric Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Turnout Percentage Feature Card */}
        <div className="crm-card p-6 sm:p-7 text-center flex flex-col items-center justify-center">
          <p className="text-[12px] uppercase tracking-wider text-[var(--muted)] font-bold mb-2">
            ТЕКУЩАЯ ЯВКА
          </p>
          <div className="text-5xl sm:text-6xl font-[800] text-[var(--blue)] tracking-tight leading-none mb-3">
            {turnout?.turnout_percent || 0}%
          </div>
          <div className="w-full bg-[var(--surface-2)] rounded-full h-2.5 overflow-hidden border border-[var(--line)] mt-1">
            <div
              className="bg-[var(--blue)] h-full transition-all duration-700 ease-out rounded-full"
              style={{ width: `${Math.min(turnout?.turnout_percent || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Voted Card */}
        <div className="crm-card p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[12px] text-[var(--muted)] font-bold uppercase tracking-wider mb-2">
              <span>ПРОГОЛОСОВАВШИХ</span>
              <Vote className="w-4 h-4 text-[var(--blue)]" />
            </div>
            <div className="text-3xl sm:text-4xl font-[800] text-[var(--ink)] tracking-tight mb-1">
              {turnout?.total_voted || 0}
            </div>
            <p className="text-[13px] text-[var(--muted)]">
              Студентов подтвердили бюллетень
            </p>
          </div>
          <div className="pt-3 border-t border-[var(--line)] text-[12px] text-[var(--blue)] font-bold flex items-center gap-1.5">
            <span>✓ Зафиксировано в реестре</span>
          </div>
        </div>

        {/* Total Eligible Card */}
        <div className="crm-card p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[12px] text-[var(--muted)] font-bold uppercase tracking-wider mb-2">
              <span>ВСЕГО ИЗБИРАТЕЛЕЙ</span>
              <Users className="w-4 h-4 text-[var(--muted)]" />
            </div>
            <div className="text-3xl sm:text-4xl font-[800] text-[var(--ink)] tracking-tight mb-1">
              {turnout?.total_eligible || 0}
            </div>
            <p className="text-[13px] text-[var(--muted)]">
              Числится в реестре вуза
            </p>
          </div>
          <div className="pt-3 border-t border-[var(--line)] text-[12px] text-[var(--muted)] font-medium">
            Осталось: {Math.max((turnout?.total_eligible || 0) - (turnout?.total_voted || 0), 0)}
          </div>
        </div>

        {/* Leading Candidate Card */}
        <div className="crm-card p-6 sm:p-7 flex flex-col justify-between border-[var(--blue)]/30 bg-[var(--surface)]">
          <div>
            <div className="flex items-center justify-between text-[12px] text-[var(--blue)] font-bold uppercase tracking-wider mb-2">
              <span>ТЕКУЩЕЕ 1-Е МЕСТО</span>
              <Award className="w-4 h-4 text-[var(--blue)]" />
            </div>
            <div className="text-[17px] font-bold text-[var(--ink)] truncate mb-1">
              {leader ? leader.full_name : 'Ожидание голосов'}
            </div>
            <p className="text-[13px] text-[var(--muted)] truncate">
              {leader ? `${leader.votes} голосов (${leader.percent}%)` : '—'}
            </p>
          </div>
          <div className="pt-3 border-t border-[var(--line)] text-[12px] text-[var(--blue)] font-bold flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Наибольшее число голосов</span>
          </div>
        </div>
      </div>

      {/* Dynamic Animated Race & Leaderboard Section */}
      <div className="crm-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[var(--line)] mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-[var(--blue)]" />
              <h2 className="text-[20px] sm:text-[22px] font-[800] text-[var(--ink)] tracking-tight">
                Живая явка и распределение голосов
              </h2>
            </div>
            <p className="text-[13.5px] text-[var(--muted)]">
              Позиции кандидатов перестраиваются и анимируются в реальном времени по мере поступления бюллетеней
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="blue">
              Кандидатов: {candidates.length}
            </Badge>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="p-10 text-center text-[var(--muted)] text-[14px]">
            Кандидаты для данных выборов еще не зарегистрированы.
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((cand, index) => {
              const isFirst = index === 0 && cand.votes > 0;
              const isSecond = index === 1 && cand.votes > 0;
              const isThird = index === 2 && cand.votes > 0;
              const isHighlighted = highlightedCandidateId === cand.candidate_id;

              return (
                <div
                  key={cand.candidate_id}
                  className={`p-4 sm:p-5 rounded-[18px] border transition-all duration-700 ease-in-out relative overflow-hidden ${
                    isHighlighted
                      ? 'ring-2 ring-[var(--blue)] bg-[var(--blue-soft)]/50 scale-[1.01] shadow-md'
                      : isFirst
                      ? 'bg-gradient-to-r from-[var(--surface)] via-[var(--surface)] to-amber-500/5 border-amber-400/40 shadow-xs'
                      : 'bg-[var(--surface)] border-[var(--line)] hover:border-[var(--blue)]/30'
                  }`}
                >
                  {/* Top Race Info Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Rank Badge */}
                      <div className="w-10 h-10 rounded-[12px] shrink-0 flex items-center justify-center font-bold text-[14px] font-mono shadow-xs">
                        {isFirst ? (
                          <div className="w-full h-full rounded-[12px] bg-[var(--blue)] text-white flex items-center justify-center font-bold">
                            #1
                          </div>
                        ) : isSecond ? (
                          <div className="w-full h-full rounded-[12px] bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] flex items-center justify-center font-bold">
                            #2
                          </div>
                        ) : isThird ? (
                          <div className="w-full h-full rounded-[12px] bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] flex items-center justify-center font-bold">
                            #3
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-[12px] bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)] flex items-center justify-center font-medium">
                            #{index + 1}
                          </div>
                        )}
                      </div>

                      {/* Candidate Avatar / Photo */}
                      <div className="w-12 h-12 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] overflow-hidden shrink-0 flex items-center justify-center text-[var(--blue)] font-bold text-[16px]">
                        {cand.photo ? (
                          <img
                            src={getMediaUrl(cand.photo)}
                            alt={cand.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = `<span class="text-[var(--blue)] font-bold text-[15px]">${cand.full_name.slice(0, 2).toUpperCase()}</span>`;
                              }
                            }}
                          />
                        ) : (
                          cand.full_name.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      {/* Candidate Details */}
                      <div className="min-w-0">
                        <h3 className="text-[16px] sm:text-[17px] font-bold text-[var(--ink)] truncate">
                          {cand.full_name}
                        </h3>

                        {cand.position && (
                          <div className="text-[12.5px] text-[var(--blue)] font-medium truncate">
                            {cand.position}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vote Count & Percent */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--line)]">
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline gap-1.5 sm:justify-end">
                          <span className={`text-[20px] sm:text-[22px] font-[800] tracking-tight transition-colors duration-300 ${
                            isHighlighted ? 'text-[var(--blue)] scale-110' : 'text-[var(--ink)]'
                          }`}>
                            {cand.votes}
                          </span>
                          <span className="text-[12.5px] text-[var(--muted)] font-medium">голосов</span>
                        </div>
                      </div>

                      <div className="min-w-[64px] text-right">
                        <span className={`inline-block text-[13px] font-bold px-2.5 py-1 rounded-[8px] transition-all ${
                          isFirst
                            ? 'bg-[var(--blue)] text-white shadow-xs'
                            : 'bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]'
                        }`}>
                          {cand.percent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Animated Progress Track */}
                  <div className="w-full bg-[var(--surface-2)] rounded-full h-3 overflow-hidden border border-[var(--line)]">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out bg-[var(--blue)]"
                      style={{ width: `${Math.min(cand.percent || 0, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security & Audit notice */}
      <div className="crm-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[15px] sm:text-[16px] font-bold text-[var(--ink)] mb-1">
              Безопасность и тайна голосования Dobush.kg
            </h4>
            <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)] leading-relaxed">
              Все бюллетени зафиксированы в зашифрованном виде. Реестр явки студентов физически изолирован от бюллетеней в базе данных. Вы можете в любой момент нажать «Завершить выборы» для формирования официального протокола и выгрузки Excel-отчета.
            </p>
          </div>
        </div>
      </div>

      {/* Finish Election Modal */}
      <Modal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        title="Завершение голосования"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {finishError && (
            <div className="p-3.5 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{finishError}</span>
            </div>
          )}

          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            Вы действительно хотите завершить выборы? После этого прием голосов будет немедленно остановлен, сформируется финальный протокол и результаты будут зафиксированы.
          </p>

          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsFinishModalOpen(false)}
              disabled={isFinishing}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={confirmFinishElection}
              isLoading={isFinishing}
            >
              Завершить и открыть итоги
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
