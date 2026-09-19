'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Vote, ShieldCheck, RefreshCw, CheckSquare,
  ArrowLeft, AlertCircle, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

export default function ElectionTurnoutPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = String(params.id || '');

  const [turnout, setTurnout] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  const fetchTurnout = () => {
    api.getElectionTurnout(electionId)
      .then(data => {
        setTurnout(data);
        setLastUpdated(new Date());
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

        {/* Remaining Eligible Voters Card */}
        <div className="crm-card p-6 sm:p-7 flex flex-col justify-between border-[var(--blue)]/30 bg-[var(--surface)]">
          <div>
            <div className="flex items-center justify-between text-[12px] text-[var(--blue)] font-bold uppercase tracking-wider mb-2">
              <span>ОСТАЛОСЬ ГОЛОСОВ</span>
              <Users className="w-4 h-4 text-[var(--blue)]" />
            </div>
            <div className="text-3xl sm:text-4xl font-[800] text-[var(--ink)] tracking-tight mb-1">
              {Math.max((turnout?.total_eligible || 0) - (turnout?.total_voted || 0), 0)}
            </div>
            <p className="text-[13px] text-[var(--muted)]">
              Ожидают участия в голосовании
            </p>
          </div>
          <div className="pt-3 border-t border-[var(--line)] text-[12px] text-[var(--blue)] font-bold flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Активный избирательный процесс</span>
          </div>
        </div>
      </div>

      {/* Live Turnout Telemetry & Timeline Section */}
      <div className="crm-card p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-[var(--blue)]" />
              <h2 className="text-[20px] sm:text-[22px] font-[800] text-[var(--ink)] tracking-tight">
                Телеметрия явки и статус голосования
              </h2>
            </div>
            <p className="text-[13.5px] text-[var(--muted)]">
              Динамика участия студентов в режиме реального времени без раскрытия персонифицированных результатов
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="blue" dot={true}>
              ТАЙНА ВОЛЕИЗЪЯВЛЕНИЯ
            </Badge>
          </div>
        </div>

        {/* Big Turnout Progress Bar with Milestones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-[var(--ink)]">Прогресс участия избирателей</span>
            <span className="font-bold font-mono text-[var(--blue)] text-[15px]">{turnout?.turnout_percent || 0}%</span>
          </div>

          <div className="w-full bg-[var(--surface-2)] rounded-full h-5 overflow-hidden border border-[var(--line)] p-0.5 relative">
            <div
              className="bg-gradient-to-r from-[var(--blue)] to-[var(--blue-hover)] h-full transition-all duration-700 ease-out rounded-full"
              style={{ width: `${Math.min(turnout?.turnout_percent || 0, 100)}%` }}
            />
          </div>

          {/* Scale Milestones */}
          <div className="flex justify-between text-[11px] text-[var(--muted)] font-mono px-1">
            <span>0%</span>
            <span>25% (Кворум 1)</span>
            <span>50% (Половина)</span>
            <span>75% (Высокая явка)</span>
            <span>100%</span>
          </div>
        </div>

        {/* Voting Timeline & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] space-y-1">
            <div className="text-[11.5px] text-[var(--muted)] uppercase font-bold tracking-wider">
              Начало голосования
            </div>
            <div className="text-[14px] font-bold text-[var(--ink)] font-mono">
              {turnout?.starts_at ? new Date(turnout.starts_at).toLocaleString('ru-RU') : '—'}
            </div>
          </div>

          <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] space-y-1">
            <div className="text-[11.5px] text-[var(--muted)] uppercase font-bold tracking-wider">
              Окончание голосования
            </div>
            <div className="text-[14px] font-bold text-[var(--ink)] font-mono">
              {turnout?.ends_at ? new Date(turnout.ends_at).toLocaleString('ru-RU') : '—'}
            </div>
          </div>

          <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] space-y-1">
            <div className="text-[11.5px] text-[var(--muted)] uppercase font-bold tracking-wider">
              Статус процесса
            </div>
            <div className="text-[14px] font-bold text-[var(--green)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
              <span>{turnout?.status === 'active' ? 'Идет голосование' : 'Завершено'}</span>
            </div>
          </div>
        </div>

        {/* Secrecy Protocol Card */}
        <div className="p-5 rounded-[16px] bg-[var(--blue-soft)]/40 border border-[var(--blue)]/20 flex items-start gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--blue)] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-[13px] text-[var(--body)] leading-relaxed">
            <h4 className="font-bold text-[var(--ink)] text-[14.5px]">
              Кандидаты и распределение голосов скрыты в режиме онлайн
            </h4>
            <p>
              В строгом соответствии со стандартом тайны голосования Dobush.kg и Регламентом электронных выборов, голоса за конкретных кандидатов зашифрованы в базе данных. Они будут автоматически расшифрованы и подсчитаны только после официального завершения голосования.
            </p>
            <p className="text-[12.5px] text-[var(--muted)] pt-1">
              Для подведения окончательных итогов нажмите <strong>«Завершить выборы»</strong> вверху страницы.
            </p>
          </div>
        </div>
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
