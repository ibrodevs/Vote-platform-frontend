'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  School, Vote, CheckCircle2, BarChart3, Plus, Activity,
  RefreshCw, ShieldCheck, ArrowUpRight, Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      api.getAdminUniversities().catch(() => ({ results: [] })),
      api.getAdminElections().catch(() => ({ results: [] }))
    ])
      .then(([unisRes, electionsRes]) => {
        const uList = Array.isArray(unisRes) ? unisRes : (Array.isArray(unisRes?.results) ? unisRes.results : []);
        const eList = Array.isArray(electionsRes) ? electionsRes : (Array.isArray(electionsRes?.results) ? electionsRes.results : []);
        setUniversities(uList);
        setElections(eList);
      })
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

    loadData();
  }, [router]);

  const isSuperAdmin = adminUser?.role === 'super_admin';
  const electionsList = Array.isArray(elections) ? elections : [];
  const activeElections = electionsList.filter(e => e.status === 'active');
  const finishedElections = electionsList.filter(e => e.status === 'finished');

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-[28px] sm:text-[32px] font-[700] tracking-[-0.025em] text-[var(--ink)]">
              Контрольная панель CRM
            </h1>
            <Badge variant={isSuperAdmin ? 'blue' : 'gray'}>
              {isSuperAdmin ? 'SUPER ADMIN' : 'UNIVERSITY ADMIN'}
            </Badge>
          </div>
          <p className="text-[14px] text-[var(--muted)]">
            {adminUser?.full_name} • {adminUser?.email} {adminUser?.university_details ? `(${adminUser.university_details.name})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="w-[42px] h-[42px] rounded-[12px] border border-[var(--field-line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors bg-[var(--surface)] flex items-center justify-center cursor-pointer shadow-sm"
            title="Обновить данные"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[var(--blue)]' : ''}`} />
          </button>
          <Link href="/admin/elections">
            <Button variant="primary" size="md" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Создать выборы</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="crm-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--muted)] text-[12px] font-bold tracking-wider uppercase mb-3">
            <span>АКТИВНЫЕ ВЫБОРЫ</span>
            <Vote className="w-5 h-5 text-[var(--blue)]" />
          </div>
          <div className="text-[36px] font-[800] tracking-[-0.025em] text-[var(--ink)] mb-2">
            {activeElections.length}
          </div>
          <div>
            {activeElections.length > 0 ? (
              <Badge variant="green" dot={true}>
                ИДЕТ ГОЛОСОВАНИЕ
              </Badge>
            ) : (
              <Badge variant="gray">
                НЕТ АКТИВНЫХ
              </Badge>
            )}
          </div>
        </div>

        {/* Card 2 */}
        <div className="crm-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--muted)] text-[12px] font-bold tracking-wider uppercase mb-3">
            <span>ЗАВЕРШЕННЫЕ</span>
            <CheckCircle2 className="w-5 h-5 text-[var(--muted)]" />
          </div>
          <div className="text-[36px] font-[800] tracking-[-0.025em] text-[var(--ink)] mb-2">
            {finishedElections.length}
          </div>
          <div>
            <Badge variant="blue">
              ИТОГИ ПОДВЕДЕНЫ
            </Badge>
          </div>
        </div>

        {/* Card 3 */}
        <div className="crm-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--muted)] text-[12px] font-bold tracking-wider uppercase mb-3">
            <span>УНИВЕРСИТЕТЫ</span>
            <School className="w-5 h-5 text-[var(--muted)]" />
          </div>
          <div className="text-[36px] font-[800] tracking-[-0.025em] text-[var(--ink)] mb-2">
            {universities.length}
          </div>
          <div>
            <Badge variant="gray">
              {isSuperAdmin ? 'В СИСТЕМЕ' : 'ВАШ УНИВЕРСИТЕТ'}
            </Badge>
          </div>
        </div>

        {/* Card 4 */}
        <div className="crm-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--muted)] text-[12px] font-bold tracking-wider uppercase mb-3">
            <span>ДЕКУПЛИНГ СТАТУС</span>
            <ShieldCheck className="w-5 h-5 text-[var(--blue)]" />
          </div>
          <div className="text-[20px] font-[800] text-[var(--ink)] mb-2">
            100% АНОНИМНОСТЬ
          </div>
          <div>
            <Badge variant="green" dot={true}>
              ZERO FK LINKAGE
            </Badge>
          </div>
        </div>
      </div>

      {/* Active Elections Live Monitor Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-[var(--ink)]">
            Текущие избирательные кампании
          </h2>
          <Link
            href="/admin/elections"
            className="text-[13.5px] font-medium text-[var(--blue)] hover:underline inline-flex items-center gap-1"
          >
            <span>Все кампании</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[var(--muted)] text-[14px] crm-card">
            Загрузка состояния кампаний...
          </div>
        ) : activeElections.length === 0 ? (
          <div className="crm-card p-10 text-center">
            <Vote className="w-10 h-10 text-[var(--muted-2)] mx-auto mb-3" />
            <h3 className="text-[17px] font-bold text-[var(--ink)] mb-1.5">
              В данный момент нет активных выборов
            </h3>
            <p className="text-[14px] text-[var(--muted)] mb-5 max-w-md mx-auto">
              Запланируйте новую избирательную кампанию или запустите черновик во вкладке «Выборы».
            </p>
            <Link href="/admin/elections">
              <Button variant="primary" size="sm">
                Перейти к выборам
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeElections.map((elec) => (
              <div
                key={elec.id}
                className="crm-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Badge variant="green" dot={true}>
                      ГОЛОСОВАНИЕ ИДЕТ
                    </Badge>
                    <span className="text-[13px] text-[var(--muted)] font-medium">
                      {elec.university_details?.name}
                    </span>
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--ink)] mb-1">
                    {elec.title}
                  </h3>
                  <p className="text-[14px] text-[var(--muted)] line-clamp-1">
                    {elec.description || 'Описание не указано'}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-[13px] text-[var(--muted)]">
                    <span>Кандидатов: <strong className="text-[var(--ink)]">{elec.candidates_count || 0}</strong></span>
                    <span>•</span>
                    <span>Окончание: {new Date(elec.ends_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                  <Link href={`/admin/elections/${elec.id}/turnout`}>
                    <Button variant="primary" size="md" className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Мониторинг явки</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link href="/admin/candidates" className="group block">
          <div className="crm-card p-6 hover:border-[var(--blue)] transition-all">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-[16px] font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors mb-1">
              Кандидаты
            </h4>
            <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
              Регистрация профилей, программ и порядок в избирательном бюллетене.
            </p>
          </div>
        </Link>

        <Link href="/admin/students" className="group block">
          <div className="crm-card p-6 hover:border-[var(--blue)] transition-all">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] mb-3">
              <School className="w-5 h-5" />
            </div>
            <h4 className="text-[16px] font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors mb-1">
              Реестр студентов
            </h4>
            <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
              Пакетный импорт списков через Excel/CSV и контроль права голоса.
            </p>
          </div>
        </Link>

        <Link href="/admin/elections" className="group block">
          <div className="crm-card p-6 hover:border-[var(--blue)] transition-all">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-[16px] font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors mb-1">
              Протоколы и результаты
            </h4>
            <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
              Выгрузка официальных протоколов завершенных выборов в Excel (.xlsx).
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
