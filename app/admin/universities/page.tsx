'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, AlertCircle, School, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, ApiError } from '@/lib/api';

export default function AdminUniversitiesPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUni, setEditingUni] = useState<any>(null);
  const [name, setName] = useState('');
  const [nameKy, setNameKy] = useState('');
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete modal state
  const [uniToDelete, setUniToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUniversities = () => {
    setIsLoading(true);
    setPageError('');
    api.getAdminUniversities()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        setUniversities(list);
      })
      .catch(err => {
        console.error('Failed to load universities', err);
        setPageError('Не удалось загрузить список университетов');
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

    loadUniversities();

    const handleCreateEvent = () => openCreateModal();
    window.addEventListener('admin-create-universities', handleCreateEvent);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('create') === '1' || params.get('create') === 'true') {
        openCreateModal();
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    return () => {
      window.removeEventListener('admin-create-universities', handleCreateEvent);
    };
  }, [router]);

  const openCreateModal = () => {
    setEditingUni(null);
    setName('');
    setNameKy('');
    setCode('');
    setIsActive(true);
    setIsRegistrationOpen(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (uni: any) => {
    setEditingUni(uni);
    setName(uni.name);
    setNameKy(uni.name_ky || '');
    setCode(uni.code);
    setIsActive(uni.is_active);
    setIsRegistrationOpen(uni.is_registration_open !== false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);

    try {
      const payload: any = {
        name,
        name_ky: nameKy,
        code,
        is_active: isActive,
        is_registration_open: isRegistrationOpen
      };

      if (editingUni) {
        await api.updateAdminUniversity(editingUni.id, payload);
      } else {
        await api.createAdminUniversity(payload);
      }
      setIsModalOpen(false);
      loadUniversities();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ошибка при сохранении университета');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteUni = async () => {
    if (!uniToDelete) return;
    setIsDeleting(true);
    setPageError('');

    try {
      await api.deleteAdminUniversity(uniToDelete.id);
      setUniToDelete(null);
      loadUniversities();
    } catch (err: any) {
      setPageError('Ошибка при удалении университета: ' + (err.message || 'серверная ошибка'));
    } finally {
      setIsDeleting(false);
    }
  };

  const universitiesList = Array.isArray(universities) ? universities : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-[700] tracking-[-0.025em] text-[var(--ink)] mb-1">
            Управление университетами
          </h1>
          <p className="text-[14px] text-[var(--muted)]">
            Реестр образовательных учреждений, факультетов и их параметров подключения
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} className="gap-2 shadow-[var(--shadow-blue-btn)]">
          <Plus className="w-4 h-4" />
          <span>Добавить университет</span>
        </Button>
      </div>

      {pageError && (
        <div className="p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pageError}</span>
          </div>
          <button onClick={() => setPageError('')} className="p-1 hover:bg-black/5 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-[var(--muted)] text-[14px] crm-card">
          Загрузка университетов...
        </div>
      ) : universitiesList.length === 0 ? (
        <div className="p-10 crm-card text-center text-[14px] text-[var(--muted)] max-w-md mx-auto">
          Университеты не найдены.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {universitiesList.map(uni => (
            <div
              key={uni.id}
              className="crm-card p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="blue">
                    {uni.code.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant={uni.is_registration_open !== false ? 'green' : 'red'}>
                      {uni.is_registration_open !== false ? 'РЕГИСТРАЦИЯ ОТКРЫТА' : 'РЕГИСТРАЦИЯ ЗАКРЫТА'}
                    </Badge>
                    <Badge variant={uni.is_active ? 'green' : 'gray'} dot={uni.is_active}>
                      {uni.is_active ? 'АКТИВЕН' : 'НЕАКТИВЕН'}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-[19px] font-bold text-[var(--ink)] mb-1">
                  {uni.name}
                </h3>
                <p className="text-[13.5px] text-[var(--muted)] mb-4">
                  {uni.name_ky}
                </p>

                <div className="flex flex-wrap gap-4 text-[13px] text-[var(--muted)] mb-4">
                  <span>Студентов: <strong className="text-[var(--ink)] font-bold">{uni.students_count || 0}</strong></span>
                  <span>•</span>
                  <span>Факультетов: <strong className="text-[var(--blue)] font-bold">{uni.faculties?.length || 0}</strong></span>
                  <span>•</span>
                  <span>Активных выборов: <strong className="text-[var(--ink)] font-bold">{uni.active_elections_count || 0}</strong></span>
                </div>

                {/* Faculties Preview */}
                {uni.faculties && uni.faculties.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11.5px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                      Факультеты:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {uni.faculties.map((fac: any) => (
                        <span
                          key={fac.id || fac.name}
                          className="px-2 py-0.5 rounded-[6px] bg-[var(--surface-2)] border border-[var(--line)] text-[12px] text-[var(--body)]"
                        >
                          {fac.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-[13px] font-mono text-[var(--muted)]">
                  /vote/{uni.code}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(uni)}
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                    title="Редактировать"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setUniToDelete(uni)}
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--red-bg)] transition-colors cursor-pointer"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit University Drawer (Side Menu) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUni ? 'Редактирование университета' : 'Добавление нового университета'}
        subtitle={editingUni ? 'Изменение данных университета' : 'Регистрация вуза в системе'}
        maxWidth="lg"
        variant="drawer"
      >
        {errorMsg && (
          <div className="mb-5 p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Название на русском *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Кыргызский государственный технический университет..."
              className="crm-input"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Аталышы кыргызча (на кыргызском) *
            </label>
            <input
              type="text"
              value={nameKy}
              onChange={e => setNameKy(e.target.value)}
              placeholder="И. Раззаков атындагы Кыргыз мамлекеттик..."
              className="crm-input"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Код университета (slug для ссылок) *
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="kstu"
              className="crm-input font-mono"
              required
            />
          </div>


          <div className="flex flex-col gap-2.5 pt-2">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="is_reg_open"
                checked={isRegistrationOpen}
                onChange={e => setIsRegistrationOpen(e.target.checked)}
                className="w-4 h-4 rounded-[4px] accent-[var(--blue)] cursor-pointer"
              />
              <label htmlFor="is_reg_open" className="text-[13.5px] font-medium text-[var(--body)] cursor-pointer">
                Разрешить самостоятельную регистрацию студентов
              </label>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded-[4px] accent-[var(--blue)] cursor-pointer"
              />
              <label htmlFor="is_active" className="text-[13.5px] font-medium text-[var(--body)] cursor-pointer">
                Университет активен и принимает участие в выборах
              </label>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
            >
              {editingUni ? 'Сохранить изменения' : 'Создать университет'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(uniToDelete)}
        onClose={() => setUniToDelete(null)}
        title="Удаление университета"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            Вы действительно хотите удалить университет{' '}
            <strong className="text-[var(--ink)] font-bold">«{uniToDelete?.name}»</strong>?
            Все связанные факультеты, выборы и учетные записи студентов будут удалены.
          </p>
          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setUniToDelete(null)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={confirmDeleteUni}
              isLoading={isDeleting}
            >
              Удалить навсегда
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
