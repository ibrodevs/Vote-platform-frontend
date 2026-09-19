'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, CheckCircle2, XCircle, Edit2, Upload,
  Image as ImageIcon, ArrowUpDown, Calendar, ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, getMediaUrl } from '@/lib/api';

export default function AdminRecentElectionsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Edit Featured modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingElection, setEditingElection] = useState<any>(null);
  const [isFeatured, setIsFeatured] = useState(true);
  const [featuredOrder, setFeaturedOrder] = useState(1);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadElections = () => {
    setIsLoading(true);
    setPageError('');
    api.getAdminFeaturedElections()
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        setElections(list);
      })
      .catch((err) => {
        console.error('Failed to load elections', err);
        setPageError('Не удалось загрузить список выборов');
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
        const u = JSON.parse(savedUser);
        setAdminUser(u);
        if (u.role !== 'super_admin' && !u.is_superuser) {
          router.push('/admin/dashboard');
          return;
        }
      } catch (e) {}
    }

    loadElections();
  }, [router]);

  const openEditModal = (election: any) => {
    setEditingElection(election);
    setIsFeatured(election.is_featured !== false);
    setFeaturedOrder(election.featured_order || 1);
    setCoverFile(null);
    setCoverUrl(election.cover_image_url || '');
    setCoverPreview(election.cover_image || election.cover_image_url || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleFeatured = async (election: any) => {
    try {
      const nextFeatured = !election.is_featured;
      await api.updateElectionFeatured(election.id, {
        is_featured: nextFeatured,
        featured_order: nextFeatured ? (election.featured_order || 1) : 0,
      });
      loadElections();
    } catch (err: any) {
      alert(err.message || 'Ошибка обновления статуса');
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingElection) return;

    setErrorMsg('');
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('is_featured', String(isFeatured));
      formData.append('featured_order', String(featuredOrder));

      if (coverFile) {
        formData.append('cover_image', coverFile);
      } else if (coverUrl) {
        formData.append('cover_image_url', coverUrl.trim());
      }

      await api.updateElectionFeatured(editingElection.id, formData);
      setIsModalOpen(false);
      loadElections();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка при сохранении настроек выборов');
    } finally {
      setIsSaving(false);
    }
  };

  const featuredElections = elections
    .filter((e) => e.is_featured)
    .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--blue)]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">
              ГЛАВНАЯ СТРАНИЦА // ROOT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[800] text-[var(--ink)] tracking-tight">
            Управление блоком «Последние выборы»
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Выберите до 3 кампаний для отображения на главной странице сайта и настройте порядок.
          </p>
        </div>

        <a
          href="/#elections"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--surface)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] transition-colors self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Посмотреть на главной</span>
        </a>
      </div>

      {pageError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {pageError}
        </div>
      )}

      {/* Info notice */}
      <div className="p-4 rounded-xl bg-[var(--blue-soft)] border border-[var(--blue)]/20 text-xs text-[var(--blue-soft-text)] flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong>Как это работает:</strong> Первые 3 кампании с активным тумблером «Показывать на главной» выводятся в 3D Depth-карточках на главной странице в порядке возрастания номера позиции (1, 2, 3).
        </div>
      </div>

      {/* Featured Preview Grid (Top 3) */}
      <div>
        <h2 className="text-base font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--blue)]" />
          <span>Текущие карточки на главной ({featuredElections.length} из 3)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((slotIdx) => {
            const election = featuredElections[slotIdx];
            const cover = election ? getMediaUrl(election.cover_image || election.cover_image_url) : null;

            return (
              <div
                key={slotIdx}
                className="h-[280px] rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden relative shadow-sm flex flex-col justify-between p-5"
              >
                {/* Background image preview */}
                {cover && (
                  <div className="absolute inset-0 z-0">
                    <img src={cover} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                  </div>
                )}

                {/* Top Slot Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--blue)] text-white shadow-sm">
                    Позиция #{slotIdx + 1}
                  </span>
                  {election && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Активен
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {election ? (
                    <div className="space-y-2 text-white">
                      <span className="text-[11px] text-white/80 block uppercase tracking-wider font-semibold">
                        {election.university_details?.name || election.university_name}
                      </span>
                      <h3 className="text-base font-bold leading-snug line-clamp-2">
                        {election.title}
                      </h3>
                      <div className="pt-2 flex items-center justify-between">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(election)}
                          className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-white/20"
                        >
                          Настроить
                        </Button>
                        <button
                          onClick={() => handleToggleFeatured(election)}
                          className="text-xs text-red-300 hover:text-red-200 underline"
                        >
                          Убрать
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[var(--muted)]">
                      <p className="text-xs mb-3">Слот свободен</p>
                      <span className="text-[11px] text-[var(--muted-2)]">
                        Включите тумблер у любых выборов в списке ниже
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Elections Management Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--ink)]">
            Все выборы платформы
          </h3>
          <span className="text-xs text-[var(--muted)]">
            Всего: {elections.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-sm text-[var(--muted)]">
            <div className="w-8 h-8 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Загрузка списка выборов...
          </div>
        ) : elections.length === 0 ? (
          <div className="p-16 text-center text-sm text-[var(--muted)]">
            Выборы пока не созданы. Создайте кампанию в разделе «Выборы».
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {elections.map((election) => {
              const cover = getMediaUrl(election.cover_image || election.cover_image_url);

              return (
                <div
                  key={election.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--hover)]/60 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[var(--bg)] border border-[var(--line)] shrink-0 relative">
                      {cover ? (
                        <img src={cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                          <ImageIcon className="w-6 h-6 opacity-30" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--blue)]">
                          {election.university_details?.name || election.university_name}
                        </span>
                        <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(election.starts_at).toLocaleDateString('ru-RU')} — {new Date(election.ends_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[var(--ink)] leading-snug truncate">
                        {election.title}
                      </h4>

                      <div className="flex items-center gap-3 pt-1">
                        {election.is_featured ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> На главной (Позиция #{election.featured_order || 1})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)]">
                            <XCircle className="w-3.5 h-3.5" /> Не отображается на главной
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <Button
                      variant={election.is_featured ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleFeatured(election)}
                    >
                      {election.is_featured ? 'Убрать с главной' : 'Показать на главной'}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(election)}
                      className="gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Обложка / Позиция</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Featured Drawer (Side Menu) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Настройка выборов для главной страницы"
        subtitle="Настройка карточки и обложки в боковой панели"
        maxWidth="lg"
        variant="drawer"
      >
        <form onSubmit={handleSave} className="space-y-4 p-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <span className="block text-xs font-bold text-[var(--ink)] mb-1">Выборы</span>
            <p className="text-sm font-semibold text-[var(--ink)] leading-snug">
              {editingElection?.title}
            </p>
            <span className="text-xs text-[var(--muted)]">
              {editingElection?.university_details?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Порядковый номер на главной (1, 2, 3)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={featuredOrder}
                onChange={(e) => setFeaturedOrder(Number(e.target.value))}
                className="crm-input h-10 w-full text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[var(--line)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--blue)]" />
              </label>
              <span className="text-xs font-semibold text-[var(--ink)]">
                {isFeatured ? 'Включено на главной' : 'Отключено'}
              </span>
            </div>
          </div>

          {/* Cover Image Upload / URL */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[var(--blue)]" />
                <span>Обложка для 3D Depth Card</span>
              </label>
              <span className="text-[11px] text-[var(--muted)]">Файл или прямая ссылка</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-[var(--line)] hover:border-[var(--blue)] rounded-xl cursor-pointer bg-[var(--surface)] text-xs text-[var(--muted)] hover:text-[var(--blue)] transition-all">
                <Upload className="w-4 h-4" />
                <span>{coverFile ? coverFile.name : 'Загрузить файл обложки...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>

              <input
                type="url"
                value={coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value);
                  if (!coverFile) setCoverPreview(e.target.value);
                }}
                placeholder="Или укажите прямую ссылку на фото (https://...)"
                className="crm-input h-10 w-full text-xs"
              />
            </div>

            {coverPreview && (
              <div className="w-40 h-24 rounded-lg overflow-hidden border border-[var(--line)] relative mt-2">
                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
