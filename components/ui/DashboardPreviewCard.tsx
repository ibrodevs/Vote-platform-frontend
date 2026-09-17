'use client';

import React from 'react';
import { ShieldCheck, Activity, Database, Check } from 'lucide-react';
import { Badge } from './Badge';

export function DashboardPreviewCard() {
  return (
    <div className="crm-card p-6 font-sans text-[var(--ink)] max-w-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--line)]">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--blue)] animate-pulse" />
          <span className="text-[12px] uppercase tracking-wider text-[var(--ink)] font-bold">
            ТЕЛЕМЕТРИЯ // SECRET_BALLOT_ENGINE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="green" dot={true}>
            АКТИВЕН
          </Badge>
        </div>
      </div>

      {/* KPI mini-row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
          <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
            ДЕКУПЛИНГ
          </div>
          <div className="text-[14px] font-bold text-[var(--ink)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--blue)]" />
            <span>100% ИЗОЛЯЦИЯ</span>
          </div>
        </div>

        <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
          <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
            ЗАДЕРЖКА
          </div>
          <div className="text-[14px] font-bold text-[var(--ink)] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[var(--blue)]" />
            <span>&lt; 0.04 сек</span>
          </div>
        </div>

        <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
          <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
            СВЯЗЬ ДАННЫХ
          </div>
          <div className="text-[14px] font-bold text-[var(--ink)] flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[var(--blue)]" />
            <span>ZERO FK</span>
          </div>
        </div>
      </div>

      {/* Data series chart representation */}
      <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] mb-4">
        <div className="flex items-center justify-between text-[12px] text-[var(--muted)] mb-3 font-medium">
          <span>АКТИВНОСТЬ ГОЛОСОВАНИЯ ОНЛАЙН</span>
          <span className="text-[var(--blue)] font-bold">99.98% УСПЕХ</span>
        </div>
        <div className="h-16 flex items-end gap-1.5 pt-2">
          {[28, 45, 32, 60, 52, 75, 68, 85, 92, 78, 95, 88, 70, 84, 90, 100].map((val, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t-[3px] transition-all"
              style={{
                height: `${val}%`,
                backgroundColor: idx === 15 ? 'var(--blue)' : idx > 12 ? 'var(--blue-soft-text)' : 'var(--line-strong)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Execution protocol stream */}
      <div className="space-y-1.5 font-mono text-[12px] text-[var(--muted)] bg-[var(--surface-2)] p-3.5 rounded-[12px] border border-[var(--line)]">
        <div className="flex items-center justify-between text-[11px] text-[var(--muted-2)] border-b border-[var(--line)] pb-1.5 mb-1.5 font-sans font-semibold">
          <span>ПРОТОКОЛ ТРАНЗАКЦИЙ (ACID)</span>
          <span className="text-[var(--green)]">DATABASE LOCK: OK</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--ink)]">
          <span className="text-[var(--blue)]">✓</span>
          <span>VoteRecord.create(student_hash=SHA256)</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--ink)]">
          <span className="text-[var(--blue)]">✓</span>
          <span>Ballot.create(candidate=ANON, no_linkage=true)</span>
        </div>
      </div>
    </div>
  );
}
