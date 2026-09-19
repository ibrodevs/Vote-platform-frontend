'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, Download, Search, AlertCircle,
  FileSpreadsheet, RefreshCw, Lock, Unlock, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, ApiError } from '@/lib/api';

export default function AdminStudentsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUniId, setSelectedUniId] = useState<string>('');

  const [students, setStudents] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [faculty, setFaculty] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [votedFilter, setVotedFilter] = useState<'all' | 'voted' | 'not_voted'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Registration toggle states
  const [isTogglingReg, setIsTogglingReg] = useState<boolean>(false);
  const [regConfirmModalOpen, setRegConfirmModalOpen] = useState<boolean>(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string>('');
  const [regErrorMsg, setRegErrorMsg] = useState<string>('');

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string>('');

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
  }, [router]);

  const loadStudents = () => {
    setIsLoading(true);

    api.getAdminStudents(selectedUniId === 'all' ? undefined : selectedUniId, {
      page,
      search,
      faculty: faculty || undefined,
      course: course ? Number(course) : undefined,
      onlyRegistered: true,
      voted: votedFilter === 'all' ? undefined : (votedFilter === 'voted' ? 'true' : 'false')
    })
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        setStudents(list);
        setTotalStudents(res?.count !== undefined ? res.count : list.length);
      })
      .catch(err => {
        console.error('Failed to load students', err);
        setStudents([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, [selectedUniId, page, search, faculty, course, votedFilter]);

  // Polling for Upload Batch Status
  useEffect(() => {
    if (!activeBatchId) return;

    const interval = setInterval(async () => {
      try {
        const statusData = await api.getBatchStatus(activeBatchId);
        setBatchStatus(statusData);

        if (statusData.status === 'completed' || statusData.status === 'failed') {
          clearInterval(interval);
          loadStudents();
        }
      } catch (err) {
        console.error('Batch polling error', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeBatchId]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedUniId) return;

    setUploadError('');
    setIsUploading(true);
    setBatchStatus(null);

    try {
      const response = await api.uploadStudents(selectedUniId, selectedFile);
      setActiveBatchId(response.batch_id);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setUploadError(err.message);
      } else {
        setUploadError('Не удалось загрузить файл списка');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = (format: 'csv' | 'xlsx') => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://voteplatformbackend.pythonanywhere.com/api/v1';
    window.open(`${API_BASE}/admin/students/template/?format=${format}`, '_blank');
  };

  const studentsList = Array.isArray(students) ? students : [];
  const universitiesList = Array.isArray(universities) ? universities : [];

  const currentUni = universitiesList.find(u => u.id === selectedUniId);
  const isCurrentRegOpen = selectedUniId === 'all'
    ? (universitiesList.length > 0 ? universitiesList.every(u => u.is_registration_open !== false) : true)
    : (currentUni ? currentUni.is_registration_open !== false : true);

  const handleToggleRegistration = async () => {
    setIsTogglingReg(true);
    setRegSuccessMsg('');
    setRegErrorMsg('');
    try {
      const targetUniId = selectedUniId === 'all' ? undefined : selectedUniId;
      const nextStatus = !isCurrentRegOpen;
      const res = await api.toggleStudentRegistration(targetUniId, nextStatus);

      setUniversities(prev => prev.map(u => {
        if (selectedUniId === 'all') {
          return { ...u, is_registration_open: res.is_registration_open };
        }
        if (u.id === selectedUniId) {
          return { ...u, is_registration_open: res.is_registration_open };
        }
        return u;
      }));

      setRegSuccessMsg(res.message || `Регистрация студентов успешно ${res.is_registration_open ? 'открыта' : 'закрыта'}`);
      setRegConfirmModalOpen(false);
      setTimeout(() => setRegSuccessMsg(''), 5000);
    } catch (err: any) {
      setRegErrorMsg(err?.message || 'Ошибка изменения статуса регистрации');
    } finally {
      setIsTogglingReg(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-[700] tracking-[-0.025em] text-[var(--ink)] mb-1">
            Реестр студентов
          </h1>
          <p className="text-[14px] text-[var(--muted)]">
            Список всех зарегистрированных студентов, имеющих активную учетную запись
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Registration Status & Toggle Button */}
          <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--line)] p-2 px-3.5 rounded-[14px] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-semibold text-[var(--muted)]">Регистрация:</span>
              <Badge variant={isCurrentRegOpen ? 'green' : 'red'} dot={true}>
                {isCurrentRegOpen ? 'ОТКРЫТА' : 'ЗАКРЫТА'}
              </Badge>
            </div>
            <button
              onClick={() => setRegConfirmModalOpen(true)}
              className={`h-[36px] px-3 rounded-[10px] text-[12.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCurrentRegOpen
                  ? 'bg-[var(--red-bg)] text-[var(--red)] hover:bg-[var(--red)] hover:text-white border border-[var(--red)]/20'
                  : 'bg-[var(--blue-soft)] text-[var(--blue)] hover:bg-[var(--blue)] hover:text-white border border-[var(--blue)]/20'
              }`}
              title={isCurrentRegOpen ? 'Закрыть регистрацию студентов' : 'Открыть регистрацию студентов'}
            >
              {isCurrentRegOpen ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Закрыть регистрацию</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Открыть регистрацию</span>
                </>
              )}
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setSelectedFile(null);
              setBatchStatus(null);
              setActiveBatchId(null);
              setUploadError('');
              setIsUploadOpen(true);
            }}
            className="gap-2 shadow-[var(--shadow-blue-btn)]"
          >
            <Upload className="w-4 h-4" />
            <span>Загрузить список (Excel/CSV)</span>
          </Button>
        </div>
      </div>

      {/* Success / Error banners */}
      {regSuccessMsg && (
        <div className="p-4 rounded-[12px] bg-[var(--green-bg)] border border-[var(--green)]/20 text-[var(--green)] text-[13.5px] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{regSuccessMsg}</span>
        </div>
      )}
      {regErrorMsg && (
        <div className="p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{regErrorMsg}</span>
        </div>
      )}

      {/* Controls & Filters */}
      <div className="crm-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* University selector for super_admin */}
          {adminUser?.role === 'super_admin' && (
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
                ВУЗ
              </label>
              <select
                value={selectedUniId}
                onChange={e => {
                  setSelectedUniId(e.target.value);
                  setPage(1);
                }}
                className="crm-input"
              >
                <option value="all">Все университеты</option>
                {universitiesList.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search */}
          <div className={adminUser?.role === 'super_admin' ? '' : 'sm:col-span-2'}>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Поиск студента
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Поиск по ФИО, номеру ID или email..."
                className="crm-input pl-10"
              />
            </div>
          </div>

          {/* Faculty */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Факультет
            </label>
            <input
              type="text"
              value={faculty}
              onChange={e => {
                setFaculty(e.target.value);
                setPage(1);
              }}
              placeholder="Все факультеты"
              className="crm-input"
            />
          </div>

          {/* Course */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Курс
            </label>
            <select
              value={course}
              onChange={e => {
                setCourse(e.target.value);
                setPage(1);
              }}
              className="crm-input"
            >
              <option value="">Все курсы</option>
              <option value="1">1 курс</option>
              <option value="2">2 курс</option>
              <option value="3">3 курс</option>
              <option value="4">4 курс</option>
              <option value="5">5 курс</option>
            </select>
          </div>

          {/* Voting Status Filter */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
              Голосование
            </label>
            <select
              value={votedFilter}
              onChange={e => {
                setVotedFilter(e.target.value as any);
                setPage(1);
              }}
              className="crm-input"
            >
              <option value="all">Все студенты</option>
              <option value="voted">Проголосовали</option>
              <option value="not_voted">Не голосовали</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operational Table Card */}
      <div className="table-card">
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between">
          <span className="text-[13.5px] text-[var(--muted)]">
            Всего зарегистрированных: <strong className="text-[var(--ink)] font-bold">{totalStudents}</strong>
          </span>
          <button
            onClick={loadStudents}
            className="text-[13px] font-medium text-[var(--blue)] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
        </div>

        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-left min-w-[680px]">
            <thead>
              <tr>
                <th>ID Студента</th>
                <th>ФИО</th>
                <th>Почта</th>
                <th>Факультет</th>
                <th>Курс</th>
                <th className="text-center">Голосование</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--muted)]">
                    Загрузка записей...
                  </td>
                </tr>
              ) : studentsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--muted)]">
                    Студенты не найдены.
                  </td>
                </tr>
              ) : (
                studentsList.map(s => (
                  <tr key={s.id}>
                    <td className="font-mono font-bold text-[var(--ink)]">{s.student_id}</td>
                    <td className="font-medium text-[var(--ink)]">{s.full_name}</td>
                    <td className="text-[var(--body)] font-medium">{s.email || '—'}</td>
                    <td className="text-[var(--muted)]">{s.faculty || '—'}</td>
                    <td className="font-medium text-[var(--ink)]">{s.course} курс</td>
                    <td className="text-center">
                      <Badge variant={s.has_voted ? 'green' : 'amber'} dot={s.has_voted}>
                        {s.has_voted ? 'ПРОГОЛОСОВАЛ' : 'НЕ ГОЛОСОВАЛ'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Excel / CSV Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Пакетная загрузка списка студентов"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-[13px] text-[var(--muted)] space-y-2">
            <p className="font-bold text-[var(--ink)]">Требования к структуре файла:</p>
            <p>
              Файл должен содержать колонки: <code className="text-[var(--blue)] font-mono">student_id</code>,{' '}
              <code className="text-[var(--blue)] font-mono">full_name</code>,{' '}
              <code className="text-[var(--blue)] font-mono">phone_number</code>,{' '}
              <code className="text-[var(--blue)] font-mono">faculty</code>,{' '}
              <code className="text-[var(--blue)] font-mono">course</code>.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadTemplate('csv')}
                className="text-[13px] text-[var(--blue)] hover:underline flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать CSV образец</span>
              </button>
              <span className="text-[var(--line)]">|</span>
              <button
                type="button"
                onClick={() => handleDownloadTemplate('xlsx')}
                className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать XLSX образец</span>
              </button>
            </div>
          </div>

          {uploadError && (
            <div className="p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {!activeBatchId ? (
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              <div className="border-2 border-dashed border-[var(--field-line)] hover:border-[var(--blue)] rounded-[14px] p-8 text-center bg-[var(--surface-2)] transition-colors">
                <FileSpreadsheet className="w-10 h-10 text-[var(--blue)] mx-auto mb-2" />
                <p className="text-[15px] text-[var(--ink)] font-bold mb-1">
                  {selectedFile ? selectedFile.name : 'Выберите файл Excel (.xlsx) или CSV (.csv)'}
                </p>
                <p className="text-[13px] text-[var(--muted)] mb-5">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Перетащите файл сюда или выберите на диске'}
                </p>
                <input
                  type="file"
                  id="student_file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="student_file"
                  className="inline-flex items-center h-[42px] px-5 rounded-[12px] border border-[var(--field-line)] text-[13.5px] font-medium text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--hover)] hover:border-[var(--line-strong)] cursor-pointer transition-colors shadow-sm"
                >
                  Обзор файлов
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsUploadOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!selectedFile}
                  isLoading={isUploading}
                >
                  Запустить импорт
                </Button>
              </div>
            </form>
          ) : (
            /* Asynchronous Batch Processing Status */
            <div className="space-y-4">
              <div className="p-5 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13.5px] font-medium text-[var(--muted)]">
                    Пакет: {batchStatus?.file_name || 'обработка...'}
                  </span>
                  <Badge
                    variant={
                      batchStatus?.status === 'completed'
                        ? 'green'
                        : batchStatus?.status === 'failed'
                        ? 'red'
                        : 'blue'
                    }
                  >
                    {batchStatus?.status ? batchStatus.status.toUpperCase() : 'В ОБРАБОТКЕ'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 rounded-[12px] bg-[var(--surface)] border border-[var(--line)] shadow-sm">
                    <div className="text-[11px] text-[var(--muted)] uppercase font-bold">Всего строк</div>
                    <div className="text-[24px] font-bold text-[var(--ink)] mt-1">
                      {batchStatus?.total_rows || 0}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[var(--surface)] border border-[var(--line)] shadow-sm">
                    <div className="text-[11px] text-[var(--green)] uppercase font-bold">Успешно</div>
                    <div className="text-[24px] font-bold text-[var(--green)] mt-1">
                      {batchStatus?.success_count || 0}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[var(--surface)] border border-[var(--line)] shadow-sm">
                    <div className="text-[11px] text-[var(--red)] uppercase font-bold">Ошибок</div>
                    <div className="text-[24px] font-bold text-[var(--red)] mt-1">
                      {batchStatus?.error_count || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Line-by-line Errors Viewer */}
              {batchStatus?.errors_detail && batchStatus.errors_detail.length > 0 && (
                <div className="rounded-[12px] border border-[var(--red)]/20 bg-[var(--red-bg)] p-4 max-h-48 overflow-y-auto">
                  <h5 className="text-[13px] text-[var(--red)] font-bold mb-2">
                    Построчный отчет об ошибках:
                  </h5>
                  <ul className="space-y-1 text-[12.5px] text-[var(--red)]">
                    {batchStatus.errors_detail.map((err: any, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-bold shrink-0">Строка {err.line}:</span>
                        <span>{err.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setIsUploadOpen(false);
                    loadStudents();
                  }}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Registration Status Confirmation Modal */}
      <Modal
        isOpen={regConfirmModalOpen}
        onClose={() => !isTogglingReg && setRegConfirmModalOpen(false)}
        title={isCurrentRegOpen ? 'Закрыть регистрацию студентов?' : 'Открыть регистрацию студентов?'}
        maxWidth="sm"
      >
        <div className="space-y-4 py-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
            isCurrentRegOpen ? 'bg-[var(--red-bg)] text-[var(--red)]' : 'bg-[var(--blue-soft)] text-[var(--blue)]'
          }`}>
            {isCurrentRegOpen ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
          </div>

          <p className="text-[13.5px] text-[var(--muted)] text-center leading-relaxed">
            {isCurrentRegOpen ? (
              <>
                При закрытии регистрации <strong>новые студенты не смогут создавать аккаунты</strong> на портале. Студенты, у которых уже есть аккаунт, смогут свободно входить и голосовать.
              </>
            ) : (
              <>
                Вы собираетесь <strong>открыть регистрацию</strong> для студентов. Новые студенты смогут самостоятельно регистрироваться на портале.
              </>
            )}
          </p>

          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 justify-center"
              onClick={() => setRegConfirmModalOpen(false)}
              disabled={isTogglingReg}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant={isCurrentRegOpen ? 'danger' : 'primary'}
              className="flex-1 justify-center"
              onClick={handleToggleRegistration}
              disabled={isTogglingReg}
            >
              {isTogglingReg
                ? 'Сохранение...'
                : isCurrentRegOpen
                  ? 'Да, закрыть'
                  : 'Да, открыть'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
