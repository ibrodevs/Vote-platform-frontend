'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, AlertCircle, School, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, ApiError } from '@/lib/api';

export default function AdminUniversitiesPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUni, setEditingUni] = useState<any>(null);
  const [name, setName] = useState('');
  const [nameKy, setNameKy] = useState('');
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadUniversities = () => {
    setIsLoading(true);
    api.getAdminUniversities()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        setUniversities(list);
      })
      .catch(err => console.error('Failed to load universities', err))
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
        if (u.role !== 'super_admin') {
          router.push('/admin/dashboard');
          return;
        }
      } catch (e) {}
    }

    loadUniversities();
  }, [router]);

  const openCreateModal = () => {
    setEditingUni(null);
    setName('');
    setNameKy('');
    setCode('');
    setIsActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (uni: any) => {
    setEditingUni(uni);
    setName(uni.name);
    setNameKy(uni.name_ky || '');
    setCode(uni.code);
    setIsActive(uni.is_active);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);

    try {
      if (editingUni) {
        await api.updateAdminUniversity(editingUni.id, {
          name,
          name_ky: nameKy,
          code,
          is_active: isActive
        });
      } else {
        await api.createAdminUniversity({
          name,
          name_ky: nameKy,
          code,
          is_active: isActive
        });
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

  const handleDelete = async (id: string, uniName: string) => {
    if (!confirm(`Вы действительно хотите удалить университет «${uniName}»? Все связанные данные будут удалены.`)) {
      return;
    }
    try {
      await api.deleteAdminUniversity(id);
      loadUniversities();
    } catch (err: any) {
      alert('Ошибка при удалении: ' + (err.message || 'серверная ошибка'));
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
            Реестр образовательных учреждений и их параметров подключения
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} className="gap-2 shadow-[var(--shadow-blue-btn)]">
          <Plus className="w-4 h-4" />
          <span>Добавить университет</span>
        </Button>
      </div>

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
                  <Badge variant={uni.is_active ? 'green' : 'gray'} dot={uni.is_active}>
                    {uni.is_active ? 'АКТИВЕН' : 'НЕАКТИВЕН'}
                  </Badge>
                </div>

                <h3 className="text-[19px] font-bold text-[var(--ink)] mb-1">
                  {uni.name}
                </h3>
                <p className="text-[13.5px] text-[var(--muted)] mb-4">
                  {uni.name_ky}
                </p>

                <div className="flex gap-4 text-[13px] text-[var(--muted)] mb-5">
                  <span>Студентов: <strong className="text-[var(--ink)]">{uni.students_count || 0}</strong></span>
                  <span>•</span>
                  <span>Активных выборов: <strong className="text-[var(--ink)]">{uni.active_elections_count || 0}</strong></span>
                </div>
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
                    onClick={() => handleDelete(uni.id, uni.name)}
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

      {/* Create / Edit University Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUni ? 'Редактирование университета' : 'Добавление нового университета'}
        maxWidth="md"
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

          <div className="flex items-center gap-2.5 pt-2">
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
    </div>
  );
}
