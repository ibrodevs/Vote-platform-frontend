'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit2, Trash2, AlertCircle, Users,
  Eye, ShieldAlert, CheckCircle, X, Search, School
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, ApiError } from '@/lib/api';

export default function AdminUsersPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniFilter, setSelectedUniFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('observer');
  const [universityId, setUniversityId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const [usersRes, unisRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminUniversities()
      ]);
      const uList = Array.isArray(usersRes) ? usersRes : ((usersRes as any)?.results || []);
      const uniList = Array.isArray(unisRes) ? unisRes : ((unisRes as any)?.results || []);
      setUsers(uList);
      setUniversities(uniList);
    } catch (err: any) {
      console.error('Failed to load users data', err);
      setPageError('Не удалось загрузить данные сотрудников');
    } finally {
      setIsLoading(false);
    }
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

    loadData();
  }, [router]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('observer');
    setUniversityId(universities.length > 0 ? universities[0].id : '');
    setIsActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFullName(user.full_name || '');
    setEmail(user.email || '');
    setPassword('');
    setRole(user.role || 'observer');
    setUniversityId(user.university || user.university_details?.id || '');
    setIsActive(user.is_active !== false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);

    try {
      const payload: any = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        is_active: isActive
      };

      if (role !== 'super_admin') {
        if (!universityId) {
          setErrorMsg('Выберите университет для сотрудника');
          setIsSaving(false);
          return;
        }
        payload.university_id = universityId;
      }

      if (password.trim()) {
        payload.password = password.trim();
      } else if (!editingUser) {
        setErrorMsg('Укажите пароль для нового сотрудника');
        setIsSaving(false);
        return;
      }

      if (editingUser) {
        await api.updateAdminUser(editingUser.id, payload);
      } else {
        await api.createAdminUser(payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ошибка при сохранении сотрудника');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setPageError('');

    try {
      await api.deleteAdminUser(userToDelete.id);
      setUserToDelete(null);
      loadData();
    } catch (err: any) {
      setPageError('Ошибка при удалении: ' + (err.message || 'серверная ошибка'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    // Exclude self or other superadmins from accidental deletion if desired, or keep all
    const matchesSearch =
      !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.university_details?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUni =
      selectedUniFilter === 'all' ||
      String(u.university || u.university_details?.id) === selectedUniFilter;

    const matchesRole =
      selectedRoleFilter === 'all' || u.role === selectedRoleFilter;

    return matchesSearch && matchesUni && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-[700] tracking-[-0.025em] text-[var(--ink)] mb-1">
            Сотрудники университетов
          </h1>
          <p className="text-[14px] text-[var(--muted)]">
            Создание и назначение сотрудников вузов для просмотра голосования, мониторинга и реестра
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          className="gap-2 shadow-[var(--shadow-blue-btn)]"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить сотрудника</span>
        </Button>
      </div>

      {/* Global Error Notice */}
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

      {/* Filters & Search Toolbar */}
      <div className="crm-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по ФИО, почте или университету..."
            className="crm-input pl-10"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <select
            value={selectedUniFilter}
            onChange={e => setSelectedUniFilter(e.target.value)}
            className="crm-select text-[13.5px]"
          >
            <option value="all">Все университеты</option>
            {universities.map(uni => (
              <option key={uni.id} value={uni.id}>
                {uni.name} ({uni.code.toUpperCase()})
              </option>
            ))}
          </select>

          <select
            value={selectedRoleFilter}
            onChange={e => setSelectedRoleFilter(e.target.value)}
            className="crm-select text-[13.5px]"
          >
            <option value="all">Все роли</option>
            <option value="observer">Только просмотр (Observer)</option>
            <option value="university_admin">Администратор вуза</option>
            <option value="super_admin">Супер-администратор</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="p-12 text-center text-[var(--muted)] text-[14px] crm-card">
          Загрузка учетных записей...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 crm-card text-center text-[14px] text-[var(--muted)] max-w-md mx-auto">
          Сотрудники не найдены. Создайте первого сотрудника для университета с ролью «Только просмотр».
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => {
            const isObs = user.role === 'observer';
            const isUniAdmin = user.role === 'university_admin';
            const isSuper = user.role === 'super_admin';

            return (
              <div
                key={user.id}
                className="crm-card p-5 flex flex-col justify-between hover:border-[var(--line-strong)] transition-all"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={isObs ? 'blue' : isUniAdmin ? 'green' : 'gray'}>
                      {isObs ? 'ТОЛЬКО ПРОСМОТР' : isUniAdmin ? 'АДМИН ВУЗА' : 'ROOT'}
                    </Badge>

                    <Badge variant={user.is_active ? 'green' : 'red'} dot={user.is_active}>
                      {user.is_active ? 'АКТИВЕН' : 'ОТКЛЮЧЕН'}
                    </Badge>
                  </div>

                  {/* Name & Email */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-[42px] h-[42px] rounded-full bg-[var(--blue-soft)] text-[var(--blue)] font-bold flex items-center justify-center text-[15px] shrink-0 border border-[var(--blue)]/15">
                      {user.full_name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div className="truncate">
                      <h3 className="text-[16px] font-bold text-[var(--ink)] truncate">
                        {user.full_name}
                      </h3>
                      <p className="text-[13px] text-[var(--muted)] truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* University info */}
                  <div className="p-3 rounded-[10px] bg-[var(--surface-2)] border border-[var(--line)] mb-4 text-[13px]">
                    <div className="flex items-center gap-1.5 text-[var(--muted)] mb-1">
                      <School className="w-4 h-4 text-[var(--blue)] shrink-0" />
                      <span className="text-[11.5px] font-bold uppercase tracking-wider">Привязанный ВУЗ:</span>
                    </div>
                    <p className="font-semibold text-[var(--ink)] truncate">
                      {user.university_details?.name || (isSuper ? 'Доступ ко всем вузам' : 'Не указан')}
                    </p>
                    {user.university_details?.code && (
                      <span className="text-[11px] font-mono text-[var(--muted)]">
                        Код: {user.university_details.code.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Role Permissions Description */}
                  <div className="text-[12px] text-[var(--muted)] flex items-start gap-2 mb-4 bg-[var(--hover)]/40 p-2.5 rounded-[8px]">
                    {isObs ? (
                      <>
                        <Eye className="w-4 h-4 text-[var(--blue)] shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          <strong>Режим наблюдателя:</strong> доступ к просмотру выборов, живой явке и реестру студентов без права изменений.
                        </span>
                      </>
                    ) : isUniAdmin ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-[var(--green)] shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          <strong>Администратор:</strong> управление кампаниями, кандидатами и регистрацией студентов своего вуза.
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-[var(--ink)] shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          <strong>Полный доступ:</strong> глобальное администрирование всей платформы.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-[12px] text-[var(--muted)]">
                  <span>
                    Создан: {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-1.5 rounded-[8px] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                      title="Редактировать сотрудника"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="p-1.5 rounded-[8px] text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--red-bg)] transition-colors cursor-pointer"
                      title="Удалить сотрудника"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Редактирование сотрудника' : 'Новый сотрудник университета'}
        maxWidth="md"
      >
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              ФИО сотрудника *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Например: Садыков Нурлан Бакытович"
              className="crm-input"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              Email (логин для входа в панель) *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="employee@university.kg"
              className="crm-input"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              {editingUser ? 'Новый пароль (оставьте пустым, если не меняется)' : 'Пароль учетной записи *'}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={editingUser ? '••••••••' : 'Минимум 6 символов'}
              className="crm-input"
              required={!editingUser}
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              Роль сотрудника *
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="crm-select font-medium"
            >
              <option value="observer">Сотрудник — только просмотр (Наблюдатель)</option>
              <option value="university_admin">Администратор вуза (Управление выборами)</option>
              {adminUser?.is_superuser && (
                <option value="super_admin">Супер-администратор (Полный доступ)</option>
              )}
            </select>
            <p className="text-[12px] text-[var(--muted)] mt-1.5">
              {role === 'observer'
                ? 'Сотрудник сможет входить в систему, видеть выборы, мониторинг явки и реестр студентов своего университета, но не сможет редактировать или удалять данные.'
                : 'Администратор вуза имеет право создавать выборы, управлять кандидатами и списком студентов своего вуза.'}
            </p>
          </div>

          {role !== 'super_admin' && (
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                Привязанный университет *
              </label>
              <select
                value={universityId}
                onChange={e => setUniversityId(e.target.value)}
                className="crm-select"
                required
              >
                <option value="">-- Выберите университет --</option>
                {universities.map(uni => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name} ({uni.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {editingUser && (
            <div className="pt-2">
              <label className="flex items-center gap-2 text-[13.5px] font-medium text-[var(--body)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded-[4px] accent-[var(--blue)] cursor-pointer"
                />
                <span>Учетная запись активна (разрешить вход)</span>
              </label>
            </div>
          )}

          <div className="pt-5 flex justify-end gap-3 border-t border-[var(--line)]">
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
              {editingUser ? 'Сохранить изменения' : 'Создать сотрудника'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        title="Удаление сотрудника"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            Вы действительно хотите удалить учетную запись{' '}
            <strong className="text-[var(--ink)] font-bold">«{userToDelete?.full_name}»</strong> ({userToDelete?.email})?
            Сотрудник потеряет доступ к панели управления.
          </p>
          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
