'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit2, Trash2, Search, Filter, Newspaper,
  Eye, Calendar, CheckCircle2, XCircle, Image as ImageIcon,
  ExternalLink, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, ApiError, getMediaUrl } from '@/lib/api';

export default function AdminNewsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [titleKy, setTitleKy] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryKy, setSummaryKy] = useState('');
  const [content, setContent] = useState('');
  const [contentKy, setContentKy] = useState('');
  const [category, setCategory] = useState('official');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete modal state
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSuperAdmin = adminUser?.role === 'super_admin' || adminUser?.is_superuser;

  const loadNews = () => {
    setIsLoading(true);
    setPageError('');
    api.getAdminNews({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchQuery || undefined
    })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        setNewsList(list);
      })
      .catch((err) => {
        console.error('Failed to load news', err);
        setPageError('Не удалось загрузить список новостей');
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

    loadNews();
  }, [router, selectedCategory]);

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle('');
    setTitleKy('');
    setSummary('');
    setSummaryKy('');
    setContent('');
    setContentKy('');
    setCategory('official');
    setImageFile(null);
    setImageUrl('');
    setImagePreview('');
    setIsPublished(true);
    setAuthorName(adminUser?.full_name ? `${adminUser.full_name}` : 'Пресс-служба Dobush.kg');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (article: any) => {
    setEditingArticle(article);
    setTitle(article.title || '');
    setTitleKy(article.title_ky || '');
    setSummary(article.summary || '');
    setSummaryKy(article.summary_ky || '');
    setContent(article.content || '');
    setContentKy(article.content_ky || '');
    setCategory(article.category || 'official');
    setImageFile(null);
    setImageUrl(article.image_url || '');
    setImagePreview(article.image || article.image_url || '');
    setIsPublished(article.is_published !== false);
    setAuthorName(article.author_name || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Заполните заголовок и содержание новости');
      return;
    }

    setErrorMsg('');
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('title_ky', titleKy.trim());
      formData.append('summary', summary.trim());
      formData.append('summary_ky', summaryKy.trim());
      formData.append('content', content.trim());
      formData.append('content_ky', contentKy.trim());
      formData.append('category', category);
      formData.append('is_published', String(isPublished));
      formData.append('author_name', authorName.trim() || 'Пресс-служба Dobush.kg');

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('image_url', imageUrl.trim());
      }

      if (editingArticle) {
        await api.updateAdminNews(editingArticle.id, formData);
      } else {
        await api.createAdminNews(formData);
      }

      setIsModalOpen(false);
      loadNews();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка при сохранении новости');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteAdminNews(articleToDelete.id);
      setArticleToDelete(null);
      loadNews();
    } catch (err: any) {
      alert(err.message || 'Не удалось удалить новость');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'official':
        return <span className="crm-badge crm-badge-blue">Официально</span>;
      case 'elections':
        return <span className="crm-badge crm-badge-green">Выборы</span>;
      case 'tech':
        return <span className="crm-badge crm-badge-amber">Технологии</span>;
      case 'students':
        return <span className="crm-badge crm-badge-gray">Студенчество</span>;
      default:
        return <span className="crm-badge crm-badge-gray">{cat}</span>;
    }
  };

  const filteredNews = newsList.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      a.title?.toLowerCase().includes(q) ||
      a.title_ky?.toLowerCase().includes(q) ||
      a.summary?.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--blue)]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">
              УПРАВЛЕНИЕ КОНТЕНТОМ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[800] text-[var(--ink)] tracking-tight">
            Новости платформы
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Публикация и модерация официальных новостей, релизов и отчетов о выборах.
          </p>
        </div>

        <Button onClick={openCreateModal} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span>Добавить новость</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--surface)] p-4 rounded-xl border border-[var(--line)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Поиск по заголовку или тексту..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="crm-input pl-10 h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'official', 'elections', 'tech', 'students'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {cat === 'all' && 'Все категории'}
              {cat === 'official' && 'Официально'}
              {cat === 'elections' && 'Выборы'}
              {cat === 'tech' && 'Технологии'}
              {cat === 'students' && 'Студенчество'}
            </button>
          ))}
        </div>
      </div>

      {pageError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {pageError}
        </div>
      )}

      {/* News Table / Grid */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-16 text-center text-sm text-[var(--muted)]">
            <div className="w-8 h-8 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Загрузка новостей...
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-16 text-center">
            <Newspaper className="w-12 h-12 text-[var(--muted)] mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-bold text-[var(--ink)] mb-1">Новости не найдены</h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Попробуйте изменить поисковый запрос или добавьте первую новость.
            </p>
            <Button variant="secondary" size="sm" onClick={openCreateModal} className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Добавить новость</span>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {filteredNews.map((article) => {
              const cover = getMediaUrl(article.image || article.image_url);
              const canEdit = isSuperAdmin || article.created_by === adminUser?.id;

              return (
                <div
                  key={article.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--hover)]/60 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[var(--bg)] border border-[var(--line)] shrink-0 relative">
                      {cover ? (
                        <img src={cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                          <ImageIcon className="w-6 h-6 opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(article.category)}
                        {article.is_published ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Опубликовано
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)]">
                            <XCircle className="w-3 h-3" /> Черновик
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.published_at || article.created_at).toLocaleDateString('ru-RU')}
                        </span>
                        <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views || 0}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[var(--ink)] leading-snug truncate">
                        {article.title}
                      </h3>

                      {article.summary && (
                        <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>
                      )}

                      <div className="text-[11px] text-[var(--muted)]">
                        Автор: <span className="font-medium text-[var(--ink)]">{article.author || article.author_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <a
                      href={`/news/${article.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
                      title="Открыть на сайте"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {canEdit && (
                      <button
                        onClick={() => openEditModal(article)}
                        className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--blue)] hover:bg-[var(--bg)] transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {isSuperAdmin && (
                      <button
                        onClick={() => setArticleToDelete(article)}
                        className="p-2 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticle ? 'Редактирование новости' : 'Добавление новости'}
        maxWidth="xl"
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
                Заголовок (RU) *
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
                Заголовок (KY)
              </label>
              <input
                type="text"
                value={titleKy}
                onChange={(e) => setTitleKy(e.target.value)}
                placeholder="Кыргызча аталышы"
                className="crm-input h-10 w-full"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="crm-input h-10 w-full"
              >
                <option value="official">Официально</option>
                <option value="elections">Выборы</option>
                <option value="tech">Технологии</option>
                <option value="students">Студенчество</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">Имя автора</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Пресс-служба Dobush.kg"
                className="crm-input h-10 w-full"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
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
                {isPublished ? 'Опубликовано' : 'Черновик'}
              </span>
            </div>
          </div>

          {/* Summaries RU / KY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Краткое описание (RU)
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Краткий лид для анонса"
                className="crm-input p-2.5 w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Краткое описание (KY)
              </label>
              <textarea
                rows={2}
                value={summaryKy}
                onChange={(e) => setSummaryKy(e.target.value)}
                placeholder="Кыскача маалымат"
                className="crm-input p-2.5 w-full text-xs"
              />
            </div>
          </div>

          {/* Full Content RU / KY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Полный текст статьи (RU) *
              </label>
              <textarea
                rows={7}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Основной текст статьи. Абзацы разделяйте пустой строкой."
                className="crm-input p-3 w-full text-xs leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Полный текст статьи (KY)
              </label>
              <textarea
                rows={7}
                value={contentKy}
                onChange={(e) => setContentKy(e.target.value)}
                placeholder="Макаланын негизги тексти"
                className="crm-input p-3 w-full text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Image Upload / URL */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[var(--blue)]" />
                <span>Изображение для обложки</span>
              </label>
              <span className="text-[11px] text-[var(--muted)]">Файл или прямая ссылка</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-[var(--line)] hover:border-[var(--blue)] rounded-xl cursor-pointer bg-[var(--surface)] text-xs text-[var(--muted)] hover:text-[var(--blue)] transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{imageFile ? imageFile.name : 'Выбрать файл...'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (!imageFile) setImagePreview(e.target.value);
                  }}
                  placeholder="Или вставьте URL картинки (https://...)"
                  className="crm-input h-10 w-full text-xs"
                />
              </div>
            </div>

            {imagePreview && (
              <div className="w-32 h-20 rounded-lg overflow-hidden border border-[var(--line)] relative">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Form Actions */}
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
              {isSaving ? 'Сохранение...' : editingArticle ? 'Сохранить изменения' : 'Опубликовать новость'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Superadmin only) */}
      <Modal
        isOpen={Boolean(articleToDelete)}
        onClose={() => setArticleToDelete(null)}
        title="Подтверждение удаления"
        maxWidth="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Вы действительно хотите удалить новость{' '}
            <strong className="text-[var(--ink)]">«{articleToDelete?.title}»</strong>?
            Это действие необратимо.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setArticleToDelete(null)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить новость'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
