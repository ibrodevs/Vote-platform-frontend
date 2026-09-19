'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit2, Trash2, HelpCircle, ArrowUpDown,
  CheckCircle2, XCircle, Search, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

export default function AdminFaqsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [questionKy, setQuestionKy] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerKy, setAnswerKy] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete modal state
  const [faqToDelete, setFaqToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadFaqs = () => {
    setIsLoading(true);
    setPageError('');
    api.getAdminFaqs()
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        setFaqs(list);
      })
      .catch((err) => {
        console.error('Failed to load FAQs', err);
        setPageError('Не удалось загрузить список вопросов и ответов');
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

    loadFaqs();

    const handleCreateEvent = () => openCreateModal();
    window.addEventListener('admin-create-faqs', handleCreateEvent);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('create') === '1' || params.get('create') === 'true') {
        openCreateModal();
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    return () => {
      window.removeEventListener('admin-create-faqs', handleCreateEvent);
    };
  }, [router]);

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestion('');
    setQuestionKy('');
    setAnswer('');
    setAnswerKy('');
    setOrder(faqs.length + 1);
    setIsActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (faq: any) => {
    setEditingFaq(faq);
    setQuestion(faq.question || '');
    setQuestionKy(faq.question_ky || '');
    setAnswer(faq.answer || '');
    setAnswerKy(faq.answer_ky || '');
    setOrder(faq.order ?? 0);
    setIsActive(faq.is_active !== false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !questionKy.trim() || !answer.trim() || !answerKy.trim()) {
      setErrorMsg('Пожалуйста, заполните вопрос и ответ на обоих языках (RU и KY)');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        question: question.trim(),
        question_ky: questionKy.trim(),
        answer: answer.trim(),
        answer_ky: answerKy.trim(),
        order: Number(order) || 0,
        is_active: isActive,
      };

      if (editingFaq) {
        await api.updateAdminFaq(editingFaq.id, payload);
      } else {
        await api.createAdminFaq(payload);
      }

      setIsModalOpen(false);
      loadFaqs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка при сохранении FAQ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteAdminFaq(faqToDelete.id);
      setFaqToDelete(null);
      loadFaqs();
    } catch (err: any) {
      alert(err.message || 'Не удалось удалить вопрос');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFaqs = faqs.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      item.question?.toLowerCase().includes(q) ||
      item.question_ky?.toLowerCase().includes(q) ||
      item.answer?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--blue)]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">
              УПРАВЛЕНИЕ КОНТЕНТОМ // ROOT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[800] text-[var(--ink)] tracking-tight">
            Вопросы и ответы (FAQ)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Управление блоком часто задаваемых вопросов на главной странице Dobush.kg.
          </p>
        </div>

        <Button onClick={openCreateModal} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span>Добавить вопрос</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--line)]">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Поиск по вопросу или ответу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="crm-input pl-10 h-10 w-full"
          />
        </div>
      </div>

      {pageError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {pageError}
        </div>
      )}

      {/* FAQ Items List */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-16 text-center text-sm text-[var(--muted)]">
            <div className="w-8 h-8 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Загрузка списка FAQ...
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-16 text-center">
            <HelpCircle className="w-12 h-12 text-[var(--muted)] mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-bold text-[var(--ink)] mb-1">Вопросы не найдены</h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Создайте первый вопрос и ответ для блока FAQ.
            </p>
            <Button variant="secondary" size="sm" onClick={openCreateModal} className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Добавить вопрос</span>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={faq.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-[var(--hover)]/60 transition-colors"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--blue-soft)] text-[var(--blue-soft-text)] font-bold text-xs flex items-center justify-center shrink-0">
                    #{faq.order || idx + 1}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--ink)]">
                        {faq.question}
                      </h3>
                      {faq.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Активен
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)]">
                          <XCircle className="w-3 h-3" /> Скрыт
                        </span>
                      )}
                    </div>

                    {faq.question_ky && (
                      <div className="text-xs text-[var(--muted)] font-medium">
                        KY: {faq.question_ky}
                      </div>
                    )}

                    <p className="text-xs text-[var(--body)] leading-relaxed pt-1">
                      {faq.answer}
                    </p>

                    {faq.answer_ky && (
                      <p className="text-xs text-[var(--muted)] leading-relaxed italic">
                        KY: {faq.answer_ky}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--blue)] hover:bg-[var(--bg)] transition-colors"
                    title="Редактировать"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setFaqToDelete(faq)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Drawer (Side Menu) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? 'Редактирование вопроса' : 'Новый вопрос FAQ'}
        subtitle={editingFaq ? 'Изменение ответа в боковой панели' : 'Добавление вопроса и ответа на двух языках (RU/KY)'}
        maxWidth="lg"
        variant="drawer"
      >
        <form onSubmit={handleSave} className="space-y-4 p-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Question RU / KY */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1">
              Вопрос (RU) *
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Например: Как обеспечивается тайна голосования?"
              className="crm-input h-10 w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1">
              Вопрос (KY) *
            </label>
            <input
              type="text"
              required
              value={questionKy}
              onChange={(e) => setQuestionKy(e.target.value)}
              placeholder="Суроо кыргыз тилинде"
              className="crm-input h-10 w-full text-xs"
            />
          </div>

          {/* Answer RU / KY */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1">
              Ответ (RU) *
            </label>
            <textarea
              rows={4}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Подробный ответ на вопрос..."
              className="crm-input p-3 w-full text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1">
              Ответ (KY) *
            </label>
            <textarea
              rows={4}
              required
              value={answerKy}
              onChange={(e) => setAnswerKy(e.target.value)}
              placeholder="Кыргыз тилиндеги жооп..."
              className="crm-input p-3 w-full text-xs leading-relaxed"
            />
          </div>

          {/* Order & Active toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Порядковый номер в списке
              </label>
              <input
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="crm-input h-10 w-full text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[var(--line)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--blue)]" />
              </label>
              <span className="text-xs font-semibold text-[var(--ink)]">
                {isActive ? 'Отображать на сайте' : 'Скрыть из блока'}
              </span>
            </div>
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
              {isSaving ? 'Сохранение...' : editingFaq ? 'Сохранить изменения' : 'Добавить вопрос'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(faqToDelete)}
        onClose={() => setFaqToDelete(null)}
        title="Подтверждение удаления"
        maxWidth="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Вы действительно хотите удалить вопрос{' '}
            <strong className="text-[var(--ink)]">«{faqToDelete?.question}»</strong>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setFaqToDelete(null)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
