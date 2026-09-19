'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Edit2, ExternalLink, AlertCircle, CheckCircle2,
  Clock, Shield, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

export default function AdminLegalPagesPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [titleKy, setTitleKy] = useState('');
  const [content, setContent] = useState('');
  const [contentKy, setContentKy] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isServer404, setIsServer404] = useState(false);

  const loadPages = () => {
    setIsLoading(true);
    setPageError('');
    setIsServer404(false);
    api.getAdminStaticPages()
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        setPages(list);
      })
      .catch((err: any) => {
        console.error('Failed to load legal pages', err);
        const is404 = err?.message?.includes('404') || err?.code === '404';
        if (is404) {
          setIsServer404(true);
          setPageError('Эндпоинт API /api/v1/admin/content/pages/ вернул 404. Сервер PythonAnywhere требует обновления.');
        } else {
          setPageError(err?.message || 'Не удалось загрузить список документов');
        }
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
          router.push('/admin/elections');
          return;
        }
      } catch (e) {}
    }

    loadPages();
  }, [router]);

  const openEditModal = (page: any) => {
    setEditingPage(page);
    setTitle(page.title || '');
    setTitleKy(page.title_ky || '');
    setContent(page.content || '');
    setContentKy(page.content_ky || '');
    setIsPublished(page.is_published !== false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !titleKy.trim() || !content.trim() || !contentKy.trim()) {
      setErrorMsg('Пожалуйста, заполните заголовок и текст на обоих языках (RU и KY).');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      await api.updateAdminStaticPage(editingPage.slug, {
        title: title.trim(),
        title_ky: titleKy.trim(),
        content: content.trim(),
        content_ky: contentKy.trim(),
        is_published: isPublished,
      });

      setIsModalOpen(false);
      setSuccessMsg(`Документ «${title}» успешно обновлен`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadPages();
    } catch (err: any) {
      console.error('Save page error', err);
      setErrorMsg(err.message || 'Ошибка при сохранении документа');
    } finally {
      setIsSaving(false);
    }
  };

  const getPublicUrl = (slug: string) => {
    if (slug === 'regulations') return '/regulations';
    if (slug === 'privacy') return '/privacy';
    if (slug === 'secrecy') return '/secrecy';
    return `/${slug}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
              Документы и регламенты
            </h1>
            <Badge variant="blue">ROOT</Badge>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Управление официальными текстами регламентов, политики конфиденциальности и тайны голосования на двух языках (RU / KY).
          </p>
        </div>
      </div>

      {isServer404 ? (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[var(--ink)] text-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-[15px] text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Требуется применить обновления на сервере PythonAnywhere</span>
          </div>
          <p className="text-[13px] text-[var(--muted)] leading-relaxed">
            Сервер вернул <code>404 Not Found</code> для адреса <code>/api/v1/admin/content/pages/</code>. Это означает, что на PythonAnywhere еще не подтянуты изменения из репозитория, не выполнены миграции или не перезагружен рабочий процесс веб-приложения.
          </p>
          <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] font-mono text-[12px] space-y-1.5">
            <p className="text-[var(--muted)] font-sans text-xs font-semibold">1. Выполните в Bash-консоли на PythonAnywhere:</p>
            <p className="text-[var(--blue)] font-bold select-all bg-[var(--surface)] p-2 rounded border border-[var(--field-line)]">
              git pull origin main && python manage.py migrate && python manage.py seed_content
            </p>
            <p className="text-[var(--muted)] font-sans text-xs font-semibold pt-1">2. Перезагрузите веб-приложение:</p>
            <p className="text-[var(--body)] font-sans text-[12.5px]">
              В панели управления PythonAnywhere откройте вкладку <strong>«Web»</strong> и нажмите зеленую кнопку <strong>«Reload voteplatformbackend.pythonanywhere.com»</strong>.
            </p>
          </div>
          <div className="pt-1">
            <Button size="sm" variant="secondary" onClick={loadPages}>
              Повторить попытку загрузки
            </Button>
          </div>
        </div>
      ) : pageError ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{pageError}</span>
        </div>
      ) : null}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Pages List */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)] crm-card">
          Загрузка документов...
        </div>
      ) : pages.length === 0 ? (
        <div className="p-12 text-center text-sm text-[var(--muted)] crm-card">
          Документы не найдены. Запустите сидирование на сервере.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pages.map((p) => {
            const publicHref = getPublicUrl(p.slug);
            return (
              <div
                key={p.id || p.slug}
                className="crm-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                        /{p.slug}
                      </span>
                      <Badge variant={p.is_published ? 'green' : 'gray'} dot={p.is_published}>
                        {p.is_published ? 'Опубликовано' : 'Черновик'}
                      </Badge>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] mb-1 truncate">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] font-medium truncate mb-2">
                      <strong className="text-[var(--blue)]">KY:</strong> {p.title_ky || '—'}
                    </p>

                    <div className="text-[11px] text-[var(--muted)] flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Обновлено: {new Date(p.updated_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <a
                    href={publicHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                    title="Открыть на сайте"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Просмотр</span>
                  </a>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(p)}
                    className="gap-1.5"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Редактировать</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Drawer (Side Menu) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Редактирование: ${editingPage?.title || ''}`}
        subtitle="Редактирование регламента или политики в боковой панели"
        maxWidth="xl"
        variant="drawer"
      >
        <form onSubmit={handleSave} className="space-y-4 p-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Titles RU / KY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Заголовок документа (RU) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Заголовок на русском языке"
                className="crm-input h-10 w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Документтин аталышы (KY) *
              </label>
              <input
                type="text"
                required
                value={titleKy}
                onChange={(e) => setTitleKy(e.target.value)}
                placeholder="Кыргызча аталышы"
                className="crm-input h-10 w-full"
              />
            </div>
          </div>

          {/* Content RU / KY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Полный текст документа (RU) *
              </label>
              <textarea
                rows={12}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Текст документа на русском языке. Заголовки разделов можно начинать с ##."
                className="crm-input p-3 w-full text-xs font-mono leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Документтин толук тексти (KY) *
              </label>
              <textarea
                rows={12}
                required
                value={contentKy}
                onChange={(e) => setContentKy(e.target.value)}
                placeholder="Документтин кыргыз тилиндеги тексти. Бөлүмдөрдүн аталышын ## менен баштаса болот."
                className="crm-input p-3 w-full text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-[var(--line)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--blue)]" />
            </label>
            <span className="text-xs font-semibold text-[var(--ink)]">
              {isPublished ? 'Опубликован на сайте' : 'Черновик (скрыт)'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить документ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
