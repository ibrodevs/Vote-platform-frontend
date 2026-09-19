'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Vote, Plus, Play, CheckSquare, XCircle, BarChart3,
  Eye, Calendar, Clock, AlertCircle, Link2, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, ApiError } from '@/lib/api';

export default function AdminElectionsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUniId, setSelectedUniId] = useState('');
  const [title, setTitle] = useState('');
  const [titleKy, setTitleKy] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionKy, setDescriptionKy] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadElections = () => {
    setIsLoading(true);
    api.getAdminElections()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        setElections(list);
      })
      .catch(err => console.error('Failed to load elections', err))
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
        const u = JSON.parse(savedUser);
        setAdminUser(u);
        if (u.university) {
          setSelectedUniId(u.university);
        }
      } catch (e) {}
    }

    api.getAdminUniversities()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        setUniversities(list);
        if (list.length > 0 && !selectedUniId) {
          setSelectedUniId(list[0].id);
        }
      })
      .catch(err => console.error('Failed to load universities', err));

    loadElections();
  }, [router]);

  const openCreateModal = () => {
    setTitle('');
    setTitleKy('');
    setDescription('');
    setDescriptionKy('');

    const now = new Date();
    const plusTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    setStartsAt(now.toISOString().slice(0, 16));
    setEndsAt(plusTwoDays.toISOString().slice(0, 16));

    setErrorMsg('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniId || !title.trim()) return;

    setErrorMsg('');
    setIsSaving(true);

    try {
      await api.createElection({
        university: selectedUniId,
        title: title.trim(),
        title_ky: titleKy.trim() || title.trim(),
        description: description.trim(),
        description_ky: descriptionKy.trim(),
        status: 'draft',
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
      });

      setIsCreateOpen(false);
      loadElections();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ошибка при создании выборов');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const [actionModal, setActionModal] = useState<{
    electionId: string;
    electionTitle: string;
    action: 'start' | 'finish' | 'cancel';
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  const openActionModal = (electionId: string, electionTitle: string, action: 'start' | 'finish' | 'cancel') => {
    setActionModal({ electionId, electionTitle, action });
    setActionError('');
  };

  const confirmStatusChange = async () => {
    if (!actionModal) return;
    setIsProcessingAction(true);
    setActionError('');

    try {
      if (actionModal.action === 'start') await api.startElection(actionModal.electionId);
      if (actionModal.action === 'finish') await api.finishElection(actionModal.electionId);
      if (actionModal.action === 'cancel') await api.cancelElection(actionModal.electionId);

      setActionModal(null);
      loadElections();
    } catch (err: any) {
      setActionError(err.message || 'Ошибка сервера при изменении статуса выборов');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const copyVotingLink = (electionId: string) => {
    if (typeof window === 'undefined') return;
    const link = `${window.location.origin}/vote/elections/${electionId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(electionId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const electionsList = Array.isArray(elections) ? elections : [];
  const universitiesList = Array.isArray(universities) ? universities : [];
  const isObserver = adminUser?.role === 'observer';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-[700] tracking-[-0.025em] text-[var(--ink)] mb-1">
            Избирательные кампании
          </h1>
          <p className="text-[14px] text-[var(--muted)]">
            Управление жизненным циклом выборов, сроками и переходами статусов
          </p>
        </div>

        {!isObserver && (
          <Button
            variant="primary"
            size="md"
            onClick={openCreateModal}
            className="gap-2 shadow-[var(--shadow-blue-btn)]"
          >
            <Plus className="w-4 h-4" />
            <span>Создать кампанию</span>
          </Button>
        )}
      </div>

      {/* Elections Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[var(--muted)] text-[14px] crm-card">
          Загрузка выборов...
        </div>
      ) : electionsList.length === 0 ? (
        <div className="crm-card p-10 text-center max-w-xl mx-auto">
          <Vote className="w-10 h-10 text-[var(--muted-2)] mx-auto mb-3" />
          <h3 className="text-[17px] font-bold text-[var(--ink)] mb-1.5">
            Выборы пока не созданы
          </h3>
          <p className="text-[14px] text-[var(--muted)] mb-5">
            {isObserver ? 'В вашем университете пока нет созданных избирательных кампаний.' : 'Нажмите «Создать кампанию», чтобы начать подготовку к голосованию.'}
          </p>
          {!isObserver && (
            <Button variant="primary" size="md" onClick={openCreateModal}>
              Создать выборы
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {electionsList.map((elec) => (
            <div
              key={elec.id}
              className="crm-card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant={
                      elec.status === 'active'
                        ? 'green'
                        : elec.status === 'finished'
                        ? 'gray'
                        : elec.status === 'cancelled'
                        ? 'red'
                        : 'amber'
                    }
                    dot={elec.status === 'active'}
                  >
                    {elec.status === 'active'
                      ? 'ГОЛОСОВАНИЕ ИДЕТ'
                      : elec.status === 'draft'
                      ? 'ЧЕРНОВИК'
                      : elec.status === 'scheduled'
                      ? 'ЗАПЛАНИРОВАНЫ'
                      : elec.status === 'finished'
                      ? 'ЗАВЕРШЕНЫ'
                      : elec.status === 'cancelled'
                      ? 'ОТМЕНЕНЫ'
                      : elec.status?.toUpperCase()}
                  </Badge>

                  <span className="text-[13px] font-medium text-[var(--muted)]">
                    {elec.university_details?.name || 'ВУЗ'}
                  </span>
                </div>

                <h3 className="text-[20px] font-bold text-[var(--ink)] mb-1">
                  {elec.title}
                </h3>

                {elec.title_ky && (
                  <p className="text-[13.5px] text-[var(--muted)] italic mb-2">
                    {elec.title_ky}
                  </p>
                )}

                <p className="text-[14px] text-[var(--muted)] line-clamp-2 mb-4 max-w-3xl leading-relaxed">
                  {elec.description || 'Описание отсутствует'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[13px] text-[var(--muted)]">
                  <span>Кандидатов: <strong className="text-[var(--ink)]">{elec.candidates_count || 0}</strong></span>
                  <span className="text-[var(--line)]">•</span>
                  <span>Начало: {new Date(elec.starts_at).toLocaleString()}</span>
                  <span className="text-[var(--line)]">•</span>
                  <span>Конец: {new Date(elec.ends_at).toLocaleString()}</span>
                </div>
              </div>

              {/* State Machine Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => copyVotingLink(elec.id)}
                  className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] font-semibold transition-all cursor-pointer border ${
                    copiedId === elec.id
                      ? 'bg-[var(--green-bg)] text-[var(--green)] border-[var(--green)]/30'
                      : 'bg-[var(--surface-2)] text-[var(--ink)] border-[var(--field-line)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
                  }`}
                  title="Скопировать прямую ссылку на голосование для отправки студентам"
                >
                  {copiedId === elec.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Ссылка скопирована!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5 text-[var(--blue)]" />
                      <span>Ссылка</span>
                    </>
                  )}
                </button>

                {!isObserver && (elec.status === 'draft' || elec.status === 'scheduled') && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openActionModal(elec.id, elec.title, 'start')}
                    className="gap-1.5 shadow-[var(--shadow-blue-btn)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Запустить</span>
                  </Button>
                )}

                {elec.status === 'active' && (
                  <>
                    <Link href={`/admin/elections/${elec.id}/turnout`}>
                      <Button variant="primary" size="sm" className="gap-1.5 shadow-[var(--shadow-blue-btn)]">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Явка online</span>
                      </Button>
                    </Link>

                    {!isObserver && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openActionModal(elec.id, elec.title, 'finish')}
                        className="gap-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-[var(--blue)]" />
                        <span>Завершить</span>
                      </Button>
                    )}
                  </>
                )}

                {elec.status === 'finished' && (
                  <Link href={`/admin/elections/${elec.id}/results`}>
                    <Button variant="primary" size="sm" className="gap-1.5 shadow-[var(--shadow-blue-btn)]">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Итоги и протокол</span>
                    </Button>
                  </Link>
                )}

                {!isObserver && elec.status !== 'finished' && elec.status !== 'cancelled' && (
                  <button
                    onClick={() => openActionModal(elec.id, elec.title, 'cancel')}
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--red-bg)] transition-colors cursor-pointer border border-[var(--field-line)]"
                    title="Отменить выборы"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Election Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Создание избирательной кампании"
        maxWidth="lg"
      >
        {errorMsg && (
          <div className="mb-5 p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {adminUser?.role === 'super_admin' && (
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
                Университет *
              </label>
              <select
                value={selectedUniId}
                onChange={e => setSelectedUniId(e.target.value)}
                className="crm-input"
                required
              >
                {universitiesList.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Название выборов (RU) *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Выборы Президента Студенческого Сената 2026..."
              className="crm-input"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Шайлоонун аталышы (KY)
            </label>
            <input
              type="text"
              value={titleKy}
              onChange={e => setTitleKy(e.target.value)}
              placeholder="Студенттик Сенаттын Президентин шайлоо 2026..."
              className="crm-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
                Дата и время начала *
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
                className="crm-input"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
                Дата и время окончания *
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={e => setEndsAt(e.target.value)}
                className="crm-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Описание выборов (RU)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Цели, регламент и правила проведения кампании..."
              className="w-full bg-[var(--surface)] border border-[var(--field-line)] rounded-[12px] p-3.5 text-[14px] text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Сүрөттөмөсү (KY)
            </label>
            <textarea
              rows={2}
              value={descriptionKy}
              onChange={e => setDescriptionKy(e.target.value)}
              placeholder="Эрежелери жана тартиби..."
              className="w-full bg-[var(--surface)] border border-[var(--field-line)] rounded-[12px] p-3.5 text-[14px] text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all font-sans"
            />
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-[var(--line)]">
            <Button type="button" variant="secondary" size="md" onClick={() => setIsCreateOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              Создать в статусе Черновик
            </Button>
          </div>
        </form>
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={Boolean(actionModal)}
        onClose={() => setActionModal(null)}
        title={
          actionModal?.action === 'start'
            ? 'Запуск выборов'
            : actionModal?.action === 'finish'
            ? 'Завершение выборов'
            : 'Отмена выборов'
        }
        maxWidth="sm"
      >
        <div className="space-y-4">
          {actionError && (
            <div className="p-3.5 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            {actionModal?.action === 'start' && (
              <>
                Вы действительно хотите запустить голосование для выборов{' '}
                <strong className="text-[var(--ink)] font-bold">«{actionModal.electionTitle}»</strong>?
                Избиратели сразу получат доступ к бюллетеню.
              </>
            )}
            {actionModal?.action === 'finish' && (
              <>
                Вы действительно хотите завершить выборы{' '}
                <strong className="text-[var(--ink)] font-bold">«{actionModal.electionTitle}»</strong>?
                Голосование будет остановлено и откроются официальные итоги.
              </>
            )}
            {actionModal?.action === 'cancel' && (
              <>
                Вы уверены, что хотите отменить проведение выборов{' '}
                <strong className="text-[var(--ink)] font-bold">«{actionModal.electionTitle}»</strong>?
              </>
            )}
          </p>

          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setActionModal(null)}
              disabled={isProcessingAction}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant={actionModal?.action === 'start' ? 'primary' : 'danger'}
              size="md"
              onClick={confirmStatusChange}
              isLoading={isProcessingAction}
            >
              {actionModal?.action === 'start'
                ? 'Запустить сейчас'
                : actionModal?.action === 'finish'
                ? 'Завершить выборы'
                : 'Отменить выборы'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
