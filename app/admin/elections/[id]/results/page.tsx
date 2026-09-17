'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, Download, User, ArrowLeft, ShieldCheck, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

export default function ElectionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = String(params.id || '');

  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    api.getElectionResults(electionId)
      .then(data => setResults(data))
      .catch(err => {
        console.error('Results fetch error', err);
        setErrorMsg(err.message || 'Результаты пока недоступны');
      })
      .finally(() => setIsLoading(false));
  }, [electionId, router]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const blob = await api.exportElectionResults(electionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `official_protocol_${electionId.slice(0, 8)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Ошибка при экспорте файла: ' + (err.message || 'ошибка'));
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[var(--muted)] crm-card">
        <RefreshCw className="w-7 h-7 animate-spin text-[var(--blue)] mx-auto mb-3" />
        <p className="text-[16px] font-bold text-[var(--ink)]">Подсчет бюллетеней...</p>
        <p className="text-[13px] text-[var(--muted)] mt-1">Агрегация официальных результатов голосования</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="crm-card max-w-md w-full text-center p-8">
          <p className="text-[var(--red)] font-semibold text-[14.5px] mb-6">{errorMsg}</p>
          <Link href="/admin/elections">
            <Button variant="secondary" size="md">
              Вернуться к выборам
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const winner = results?.candidates?.[0];

  return (
    <div className="space-y-6">
      {/* Navigation back */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/elections"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться к списку выборов</span>
        </Link>
        <Badge variant="gray">
          ВЫБОРЫ ЗАВЕРШЕНЫ
        </Badge>
      </div>

      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-[700] tracking-[-0.025em] text-[var(--ink)] mb-1">
            Официальный протокол итогов
          </h1>
          <p className="text-[14px] text-[var(--muted)]">
            {results?.election_title} • {results?.university_name}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleExportExcel}
          isLoading={isExporting}
          className="gap-2 shrink-0 shadow-[var(--shadow-blue-btn)]"
        >
          <Download className="w-4 h-4" />
          <span>Экспорт в Excel (.xlsx)</span>
        </Button>
      </div>

      {/* Winner Spotlight Card */}
      {winner && winner.votes > 0 && (
        <div className="crm-card p-6 md:p-8 border-[var(--blue)]/30 bg-gradient-to-r from-[var(--surface)] to-[var(--blue-soft)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-[var(--blue)]/40 shrink-0 bg-[var(--surface-2)] shadow-sm">
                {winner.photo_url || winner.photo ? (
                  <img src={winner.photo_url || winner.photo} alt={winner.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-4 text-[var(--muted)]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Trophy className="w-4 h-4 text-[var(--blue)]" />
                  <span className="text-[12px] text-[var(--blue)] font-bold uppercase tracking-wider">
                    ПОБЕДИТЕЛЬ ВЫБОРОВ
                  </span>
                </div>
                <h3 className="text-[24px] sm:text-[28px] font-[800] text-[var(--ink)] tracking-tight">
                  {winner.full_name}
                </h3>
                <p className="text-[14px] text-[var(--muted)] mt-0.5">
                  {winner.position} • {winner.faculty}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-5xl sm:text-6xl font-[800] text-[var(--blue)] tracking-tight leading-none">
                {winner.percent}%
              </div>
              <p className="text-[13px] text-[var(--muted)] mt-1.5 font-medium">
                {winner.votes} голосов из {results?.total_voted}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Turnout Summary Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="crm-card p-6">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
            ВСЕГО ИЗБИРАТЕЛЕЙ
          </div>
          <div className="text-3xl sm:text-4xl font-[800] text-[var(--ink)] tracking-tight leading-none">
            {results?.total_eligible}
          </div>
          <span className="text-[12px] text-[var(--muted-2)] mt-2 block">
            В списках избирателей
          </span>
        </div>

        <div className="crm-card p-6">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--blue)] mb-2">
            ПРОГОЛОСОВАЛО
          </div>
          <div className="text-3xl sm:text-4xl font-[800] text-[var(--blue)] tracking-tight leading-none">
            {results?.total_voted}
          </div>
          <span className="text-[12px] text-[var(--muted)] mt-2 block">
            Поданных бюллетеней
          </span>
        </div>

        <div className="crm-card p-6">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
            ИТОГОВАЯ ЯВКА
          </div>
          <div className="text-3xl sm:text-4xl font-[800] text-[var(--ink)] tracking-tight leading-none">
            {results?.turnout_percent}%
          </div>
          <span className="text-[12px] text-[var(--muted-2)] mt-2 block">
            Процент участия
          </span>
        </div>
      </div>

      {/* Candidate Results Table */}
      <div className="crm-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h4 className="text-[17px] font-bold text-[var(--ink)]">
            Распределение голосов по кандидатам
          </h4>
          <Badge variant="green" dot={true}>
            Анонимный подсчет завершен
          </Badge>
        </div>

        <div className="space-y-4">
          {results?.candidates?.map((c: any, index: number) => (
            <div key={c.candidate_id || index}>
              {index > 0 && <div className="border-t border-[var(--line)] my-4" />}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-[13px] text-[var(--muted)] font-bold w-6 shrink-0">
                    #{index + 1}
                  </div>

                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--line)] bg-[var(--surface-2)] shrink-0 shadow-sm">
                    {c.photo_url || c.photo ? (
                      <img src={c.photo_url || c.photo} alt={c.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-3 text-[var(--muted)]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h5 className="text-[16px] font-bold text-[var(--ink)]">
                      {c.full_name}
                    </h5>
                    <p className="text-[13px] text-[var(--muted)]">
                      {c.faculty} • {c.position}
                    </p>

                    {/* Percentage Progress Bar */}
                    <div className="w-full max-w-md bg-[var(--surface-2)] rounded-full h-2.5 mt-2.5 overflow-hidden border border-[var(--line)]">
                      <div
                        className="bg-[var(--blue)] h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 self-end sm:self-center">
                  <div className="text-[24px] font-[800] text-[var(--ink)] leading-none">
                    {c.percent}%
                  </div>
                  <div className="text-[13px] text-[var(--muted)] mt-1">
                    {c.votes} голосов
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decoupling Verification Notice */}
      <div className="crm-card p-5 flex items-center gap-4 text-[13px] text-[var(--muted)]">
        <div className="w-9 h-9 rounded-full bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <span>
          Архитектурный аудит: результаты подсчитаны непосредственно из таблицы анонимных бюллетеней (<code className="text-[var(--blue)] font-mono">Ballot</code>) без возможности связать выбор с реестром избирателей (<code className="text-[var(--blue)] font-mono">VoteRecord</code>).
        </span>
      </div>
    </div>
  );
}
