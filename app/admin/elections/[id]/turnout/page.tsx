'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Vote, ShieldCheck, RefreshCw,
  CheckSquare, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

export default function ElectionTurnoutPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = String(params.id || '');

  const [turnout, setTurnout] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

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

    fetchTurnout();

    // Poll every 3 seconds for live telemetry
    const timer = setInterval(fetchTurnout, 3000);
    return () => clearInterval(timer);
  }, [electionId, router]);

  const handleFinishElection = async () => {
    if (!confirm('Завершить выборы? После этого голосование будет остановлено и откроются итоговые результаты по кандидатам.')) {
      return;
    }
    setIsFinishing(true);
    try {
      await api.finishElection(electionId);
      router.push(`/admin/elections/${electionId}/results`);
    } catch (err: any) {
      alert('Ошибка: ' + (err.message || 'серверная ошибка'));
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

  return (
    <div className="space-y-6">
      {/* Top return */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/elections"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться к списку выборов</span>
        </Link>
        <Badge variant="blue" dot={true}>
          LIVE POLLING (3S)
        </Badge>
      </div>

      {/* Title Block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h1 className="text-[28px] sm:text-[32px] font-[700] tracking-[-0.025em] text-[var(--ink)]">
              {turnout?.election_title || 'Мониторинг явки избирателей'}
            </h1>
            <Badge variant="green" dot={true}>
              ГОЛОСОВАНИЕ ИДЕТ
            </Badge>
          </div>
          <p className="text-[14px] text-[var(--muted)]">
            Обновлено: {lastUpdated.toLocaleTimeString()} • Телеметрия опрашивается каждые 3 секунды
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleFinishElection}
          isLoading={isFinishing}
          className="gap-2 shrink-0 shadow-sm"
        >
          <CheckSquare className="w-4 h-4 text-[var(--blue)]" />
          <span>Завершить выборы и подвести итоги</span>
        </Button>
      </div>

      {/* Big Metric Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Turnout Percentage Feature Card */}
        <div className="crm-card p-7 sm:p-8 text-center flex flex-col items-center justify-center">
          <p className="text-[12px] uppercase tracking-wider text-[var(--muted)] font-bold mb-2">
            ТЕКУЩАЯ ЯВКА
          </p>
          <div className="text-6xl sm:text-7xl font-[800] text-[var(--blue)] tracking-tight leading-none mb-3">
            {turnout?.turnout_percent || 0}%
          </div>
          <div className="w-full bg-[var(--surface-2)] rounded-full h-3 overflow-hidden border border-[var(--line)] mt-2">
            <div
              className="bg-[var(--blue)] h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(turnout?.turnout_percent || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Voted Card */}
        <div className="crm-card p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[12px] text-[var(--muted)] font-bold uppercase tracking-wider mb-3">
              <span>ПРОГОЛОСОВАВШИХ</span>
              <Vote className="w-5 h-5 text-[var(--blue)]" />
            </div>
            <div className="text-4xl sm:text-5xl font-[800] text-[var(--ink)] tracking-tight leading-none mb-2">
              {turnout?.total_voted || 0}
            </div>
            <p className="text-[13.5px] text-[var(--muted)]">
              Студентов подтвердили бюллетень в системе
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--line)] text-[13px] text-[var(--blue)] font-bold flex items-center gap-1.5">
            <span>✓ Зафиксировано в реестре участия</span>
          </div>
        </div>

        {/* Total Eligible Card */}
        <div className="crm-card p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[12px] text-[var(--muted)] font-bold uppercase tracking-wider mb-3">
              <span>ВСЕГО ИЗБИРАТЕЛЕЙ</span>
              <Users className="w-5 h-5 text-[var(--muted)]" />
            </div>
            <div className="text-4xl sm:text-5xl font-[800] text-[var(--ink)] tracking-tight leading-none mb-2">
              {turnout?.total_eligible || 0}
            </div>
            <p className="text-[13.5px] text-[var(--muted)]">
              Студентов числится в реестре вуза
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--line)] text-[13px] text-[var(--muted)] font-medium">
            Осталось проголосовать: {Math.max((turnout?.total_eligible || 0) - (turnout?.total_voted || 0), 0)}
          </div>
        </div>
      </div>

      {/* Secret Ballot Strict Anonymity Banner */}
      <div className="crm-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[var(--ink)] mb-1">
              Архитектурная блокировка данных о кандидатах во время голосования
            </h4>
            <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
              Согласно пунктам 5 и 6.2 ТЗ, пока выборы активны, эндпоинт мониторинга возвращает исключительно общее количество проголосовавших. Распределение голосов по кандидатам физически заблокировано на уровне API до момента нажатия кнопки «Завершить выборы», исключая административное давление на ход волеизъявления.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
