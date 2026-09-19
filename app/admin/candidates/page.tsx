'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Edit2, Trash2, ArrowUp, ArrowDown,
  User, AlertCircle, School, Vote, Upload,
  Image as ImageIcon, X, Check, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, ApiError, getMediaUrl } from '@/lib/api';

export default function AdminCandidatesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [candidateToDelete, setCandidateToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [adminUser, setAdminUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUniId, setSelectedUniId] = useState<string>('');

  const [allElections, setAllElections] = useState<any[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');

  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);

  const [modalUniId, setModalUniId] = useState('');
  const [modalElectionId, setModalElectionId] = useState('');
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('Кандидат');
  const [positionKy, setPositionKy] = useState('Талапкер');
  const [shortBio, setShortBio] = useState('');
  const [shortBioKy, setShortBioKy] = useState('');
  const [program, setProgram] = useState('');
  const [programKy, setProgramKy] = useState('');

  // Photo upload & preview
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Human-readable status translations in Russian (no raw "DRAFT")
  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Идет голосование';
      case 'draft':
        return 'Черновик';
      case 'scheduled':
        return 'Запланированы';
      case 'finished':
      case 'completed':
        return 'Завершены';
      case 'cancelled':
        return 'Отменены';
      default:
        return 'Черновик';
    }
  };

  const getStatusBadgeVariant = (status: string): 'green' | 'gray' | 'amber' | 'blue' | 'red' => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green';
      case 'draft':
        return 'gray';
      case 'scheduled':
        return 'amber';
      case 'finished':
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const savedUser = localStorage.getItem('admin_user');
    let userUniId = '';
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setAdminUser(u);
        if (u.university) {
          userUniId = u.university;
        }
      } catch (e) {}
    }

    // Load universities and elections in parallel
    Promise.all([
      api.getAdminUniversities().catch(() => []),
      api.getAdminElections().catch(() => [])
    ])
      .then(([unisRes, elecsRes]) => {
        const uniList = Array.isArray(unisRes) ? unisRes : (unisRes?.results || []);
        const elecList = Array.isArray(elecsRes) ? elecsRes : (elecsRes?.results || []);

        setUniversities(uniList);
        setAllElections(elecList);

        // Pick active university
        const defaultUni = userUniId || (uniList.length > 0 ? uniList[0].id : '');
        setSelectedUniId(defaultUni);

        // Filter elections for default university
        const uniElecs = elecList.filter((e: any) => String(e.university) === String(defaultUni));
        if (uniElecs.length > 0) {
          setSelectedElectionId(uniElecs[0].id);
        } else {
          setSelectedElectionId('');
        }
      })
      .catch(err => console.error('Failed to load initial data', err))
      .finally(() => setIsLoading(false));
  }, [router]);

  // Handle University change on main page
  const handleUniversityChange = (uniId: string) => {
    setSelectedUniId(uniId);
    const uniElecs = allElections.filter(e => String(e.university) === String(uniId));
    if (uniElecs.length > 0) {
      setSelectedElectionId(uniElecs[0].id);
    } else {
      setSelectedElectionId('');
      setCandidates([]);
    }
  };

  // Load candidates when selected election changes
  const loadCandidates = (electionId: string) => {
    if (!electionId) {
      setCandidates([]);
      return;
    }
    setIsLoading(true);
    api.getAdminCandidates(electionId)
      .then(data => {
        const list = Array.isArray(data) ? data : ((data as any)?.results || []);
        setCandidates(list);
      })
      .catch(err => {
        console.error('Failed to load candidates', err);
        setCandidates([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (selectedElectionId) {
      loadCandidates(selectedElectionId);
    }
  }, [selectedElectionId]);

  // Elections filtered by the main page university selector
  const availableElectionsForSelectedUni = allElections.filter(
    e => String(e.university) === String(selectedUniId)
  );

  // Elections filtered by the modal's university selector
  const availableElectionsForModalUni = allElections.filter(
    e => String(e.university) === String(modalUniId)
  );

  // Open Create Modal
  const openCreateModal = () => {
    setEditingCandidate(null);
    const initialUni = selectedUniId || (universities[0]?.id || '');
    setModalUniId(initialUni);

    const filtered = allElections.filter(e => String(e.university) === String(initialUni));
    setModalElectionId(filtered[0]?.id || selectedElectionId || '');

    setFullName('');
    setPosition('Кандидат');
    setPositionKy('Талапкер');
    setShortBio('');
    setShortBioKy('');
    setProgram('');
    setProgramKy('');
    setPhotoFile(null);
    setPhotoPreview('');
    setPhotoUrlInput('');
    setShowUrlInput(false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cand: any) => {
    setEditingCandidate(cand);
    const currentUni = cand.university || selectedUniId || '';
    setModalUniId(currentUni);
    setModalElectionId(cand.election || selectedElectionId || '');

    setFullName(cand.full_name || '');
    setPosition(cand.position || 'Кандидат');
    setPositionKy(cand.position_ky || 'Талапкер');
    setShortBio(cand.short_bio || '');
    setShortBioKy(cand.short_bio_ky || '');
    setProgram(cand.program || '');
    setProgramKy(cand.program_ky || '');
    setPhotoFile(null);
    setPhotoPreview(getMediaUrl(cand.photo || cand.photo_url) || '');
    setPhotoUrlInput(cand.photo_url || '');
    setShowUrlInput(false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Handle Photo selection from local disk
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Размер файла фотографии не должен превышать 5 МБ');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrorMsg('');
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setPhotoUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalElectionId) {
      setErrorMsg('Пожалуйста, выберите предвыборную кампанию');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Укажите ФИО кандидата');
      return;
    }
    if (shortBio.trim().length > 100 || shortBioKy.trim().length > 100) {
      setErrorMsg('Краткая биография на RU и KY не должна превышать 100 символов');
      return;
    }
    if (program.trim().length > 100 || programKy.trim().length > 100) {
      setErrorMsg('Предвыборная программа на RU и KY не должна превышать 100 символов');
      return;
    }

    setErrorMsg('');
    setIsSaving(true);

    try {
      if (photoFile) {
        // Send as FormData for binary file upload
        const formData = new FormData();
        formData.append('election', modalElectionId);
        formData.append('university', modalUniId);
        formData.append('full_name', fullName.trim());
        formData.append('position', position.trim());
        formData.append('position_ky', positionKy.trim());
        formData.append('short_bio', shortBio.trim());
        formData.append('short_bio_ky', shortBioKy.trim());
        formData.append('program', program.trim());
        formData.append('program_ky', programKy.trim());
        formData.append('photo', photoFile);
        formData.append('faculty', '');
        formData.append('course', '1');

        if (editingCandidate) {
          await api.updateCandidate(editingCandidate.id, formData);
        } else {
          await api.createCandidate(modalElectionId, formData);
        }
      } else {
        // Send as JSON
        const payload: any = {
          election: modalElectionId,
          university: modalUniId,
          full_name: fullName.trim(),
          position: position.trim(),
          position_ky: positionKy.trim(),
          short_bio: shortBio.trim(),
          short_bio_ky: shortBioKy.trim(),
          program: program.trim(),
          program_ky: programKy.trim(),
          faculty: '',
          course: 1
        };

        if (photoUrlInput.trim()) {
          payload.photo_url = photoUrlInput.trim();
        }

        if (editingCandidate) {
          await api.updateCandidate(editingCandidate.id, payload);
        } else {
          await api.createCandidate(modalElectionId, payload);
        }
      }

      setIsModalOpen(false);
      // If candidate was added to the currently selected election, reload list
      if (modalElectionId === selectedElectionId) {
        loadCandidates(selectedElectionId);
      } else {
        // Switch to the election where candidate was added
        setSelectedUniId(modalUniId);
        setSelectedElectionId(modalElectionId);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ошибка сохранения кандидата. Проверьте введенные данные.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete candidate
  const handleDelete = (id: string, name: string) => {
    setCandidateToDelete({ id, name });
    setDeleteError('');
  };

  const confirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.deleteCandidate(candidateToDelete.id);
      setCandidateToDelete(null);
      loadCandidates(selectedElectionId);
    } catch (err: any) {
      setDeleteError(err.message || 'Ошибка сервера при удалении кандидата');
    } finally {
      setIsDeleting(false);
    }
  };

  // Move candidate up/down
  const moveCandidate = async (index: number, direction: 'up' | 'down') => {
    const list = Array.isArray(candidates) ? [...candidates] : [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setCandidates(list);

    try {
      await api.reorderCandidates(selectedElectionId, list.map(c => c.id));
    } catch (err) {
      console.error('Failed to save candidate order', err);
      loadCandidates(selectedElectionId);
    }
  };

  const selectedElection = allElections.find(e => e.id === selectedElectionId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-[700] tracking-[-0.025em] text-[var(--ink)] mb-1">
            Управление кандидатами
          </h1>
          <p className="text-[14px] text-[var(--muted)]">
            Регистрация кандидатов, анкеты и настройка порядка в избирательном бюллетене
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          disabled={availableElectionsForSelectedUni.length === 0}
          className="gap-2 shadow-[var(--shadow-blue-btn)]"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить кандидата</span>
        </Button>
      </div>

      {/* Selectors: University and Election */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[16px] p-5 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* University Selector */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              Университет:
            </label>
            <div className="relative">
              <select
                value={selectedUniId}
                onChange={e => handleUniversityChange(e.target.value)}
                className="crm-input font-medium"
              >
                {universities.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Election Selector */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              Предвыборная кампания:
            </label>
            {availableElectionsForSelectedUni.length === 0 ? (
              <div className="h-[46px] px-3.5 flex items-center justify-between rounded-[12px] bg-[var(--surface-2)] border border-[var(--field-line)] text-[13.5px] text-[var(--muted)]">
                <span>В этом университете пока нет кампаний</span>
                <Link href="/admin/elections" className="text-[var(--blue)] font-semibold hover:underline text-[12.5px]">
                  Создать выборы
                </Link>
              </div>
            ) : (
              <select
                value={selectedElectionId}
                onChange={e => setSelectedElectionId(e.target.value)}
                className="crm-input font-medium"
              >
                {availableElectionsForSelectedUni.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.title} — {getStatusText(e.status)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Selected campaign status banner */}
        {selectedElection && (
          <div className="mt-4 pt-3.5 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-[var(--blue)] shrink-0" />
              <span className="font-medium text-[var(--ink)]">Текущая кампания: {selectedElection.title}</span>
              <Badge variant={getStatusBadgeVariant(selectedElection.status)} dot={selectedElection.status === 'active'}>
                {getStatusText(selectedElection.status).toUpperCase()}
              </Badge>
            </div>
            <span>Кандидатов в бюллетене: <strong className="text-[var(--ink)]">{candidates.length}</strong></span>
          </div>
        )}
      </div>

      {/* Candidates List with Drag/Order Controls */}
      {isLoading ? (
        <div className="p-12 text-center text-[var(--muted)] text-[14px] bg-[var(--surface)] border border-[var(--line)] rounded-[16px]">
          Загрузка кандидатов...
        </div>
      ) : availableElectionsForSelectedUni.length === 0 ? (
        <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[20px] shadow-[var(--shadow-card)] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] mx-auto">
            <Vote className="w-6 h-6" />
          </div>
          <h3 className="text-[17px] font-bold text-[var(--ink)]">
            В выбранном университете еще нет избирательных кампаний
          </h3>
          <p className="text-[13.5px] text-[var(--muted)] max-w-md mx-auto">
            Перед добавлением кандидатов необходимо создать хотя бы одну кампанию для данного университета.
          </p>
          <Link href="/admin/elections">
            <Button variant="primary">Перейти к созданию выборов</Button>
          </Link>
        </div>
      ) : candidates.length === 0 ? (
        <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[20px] shadow-[var(--shadow-card)] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-[17px] font-bold text-[var(--ink)]">
            В этих выборах пока нет кандидатов
          </h3>
          <p className="text-[13.5px] text-[var(--muted)] max-w-md mx-auto">
            Нажмите кнопку «Добавить кандидата», чтобы внести профиль в электронный бюллетень.
          </p>
          <Button variant="primary" size="md" onClick={openCreateModal}>
            Добавить первого кандидата
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((cand, idx) => (
            <div
              key={cand.id}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-[16px] p-5 shadow-[var(--shadow-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-[var(--blue)]/30 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Order rank controls */}
                <div className="flex flex-col items-center gap-1 shrink-0 bg-[var(--surface-2)] p-2 rounded-[12px] border border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => moveCandidate(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded-[6px] text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-20 transition-colors cursor-pointer"
                    title="Поднять выше в списке"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className="text-[12px] font-bold text-[var(--blue)]">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveCandidate(idx, 'down')}
                    disabled={idx === candidates.length - 1}
                    className="p-1 rounded-[6px] text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-20 transition-colors cursor-pointer"
                    title="Опустить ниже в списке"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Candidate Photo */}
                <div className="w-14 h-14 rounded-[14px] overflow-hidden bg-[var(--surface-2)] border border-[var(--line)] shrink-0 flex items-center justify-center font-bold text-[var(--blue)] text-[18px]">
                  {cand.photo_url || cand.photo ? (
                    <img
                      src={getMediaUrl(cand.photo || cand.photo_url)}
                      alt={cand.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    cand.full_name.slice(0, 2).toUpperCase()
                  )}
                </div>

                {/* Candidate Information */}
                <div className="space-y-1.5">
                  <h3 className="text-[17px] font-bold text-[var(--ink)]">
                    {cand.full_name}
                  </h3>
                  {cand.short_bio && (
                    <p className="text-[13px] text-[var(--muted)] line-clamp-2 max-w-xl">
                      <span className="font-semibold text-[var(--ink)]">Биография:</span> {cand.short_bio}
                    </p>
                  )}
                  {cand.program && (
                    <p className="text-[13px] text-[var(--blue)] line-clamp-2 max-w-xl">
                      <span className="font-semibold text-[var(--ink)]">Программа:</span> {cand.program}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => openEditModal(cand)}
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors cursor-pointer border border-[var(--field-line)]"
                  title="Редактировать анкету кандидата"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cand.id, cand.full_name)}
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--red-bg)] transition-colors cursor-pointer border border-[var(--field-line)]"
                  title="Удалить кандидата"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Candidate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCandidate ? 'Редактирование кандидата' : 'Добавление кандидата'}
        maxWidth="md"
      >
        {errorMsg && (
          <div className="mb-5 p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* 1. Выбор университета */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              Университет *
            </label>
            <select
              value={modalUniId}
              onChange={e => {
                const newUniId = e.target.value;
                setModalUniId(newUniId);
                const filtered = allElections.filter(el => String(el.university) === String(newUniId));
                setModalElectionId(filtered[0]?.id || '');
              }}
              className="crm-input"
              required
            >
              {universities.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Предвыборная кампания */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              Предвыборная кампания *
            </label>
            {availableElectionsForModalUni.length === 0 ? (
              <div className="p-3 rounded-[12px] bg-[var(--amber-bg)] text-[var(--amber)] text-[13px]">
                В выбранном университете нет доступных кампаний. Сначала создайте выборы.
              </div>
            ) : (
              <select
                value={modalElectionId}
                onChange={e => setModalElectionId(e.target.value)}
                className="crm-input font-medium"
                required
              >
                {availableElectionsForModalUni.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. ФИО Кандидата */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              ФИО Кандидата *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Например: Исаков Айбек Маратович"
              className="crm-input"
              required
            />
          </div>

          {/* 4. Выбор фото (Загрузка файла или ссылка) */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
              Фотография кандидата
            </label>

            {photoPreview ? (
              <div className="flex items-center gap-4 p-3.5 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)]">
                <div className="w-16 h-16 rounded-[12px] overflow-hidden bg-[var(--surface)] border border-[var(--line)] shrink-0">
                  <img src={photoPreview} alt="Превью" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-[var(--ink)] truncate">
                    {photoFile ? photoFile.name : 'Фото кандидата'}
                  </p>
                  <p className="text-[12px] text-[var(--muted)]">
                    {photoFile ? `${(photoFile.size / 1024).toFixed(1)} КБ` : 'Установлено'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="p-2 rounded-[8px] text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                  title="Удалить фото"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-[var(--field-line)] hover:border-[var(--blue)] rounded-[14px] text-center cursor-pointer transition-colors bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)]"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--blue)] mx-auto mb-2 shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-[13.5px] font-semibold text-[var(--ink)]">
                  Нажмите для выбора фото с устройства
                </p>
                <p className="text-[12px] text-[var(--muted)] mt-0.5">
                  Форматы: JPG, PNG, WEBP (до 5 МБ)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Optional URL input fallback toggle */}
            {!photoPreview && (
              <div className="mt-2">
                {!showUrlInput ? (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="text-[12.5px] text-[var(--blue)] hover:underline font-medium cursor-pointer"
                  >
                    + Или указать прямую ссылку на фото
                  </button>
                ) : (
                  <div className="space-y-1.5 mt-1.5">
                    <input
                      type="url"
                      value={photoUrlInput}
                      onChange={e => {
                        setPhotoUrlInput(e.target.value);
                        setPhotoPreview(e.target.value);
                      }}
                      placeholder="https://example.com/photo.jpg"
                      className="crm-input text-[13px]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Должность (RU & KY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                Должность / статус (RU)
              </label>
              <input
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="Кандидат / Студент 3 курса"
                className="crm-input"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                Кызмат орду / статусу (KY)
              </label>
              <input
                type="text"
                value={positionKy}
                onChange={e => setPositionKy(e.target.value)}
                placeholder="Талапкер / 3-курстун студенти"
                className="crm-input"
              />
            </div>
          </div>

          {/* 6. Краткая биография (RU & KY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[var(--ink)]">
                  Краткая биография (RU)
                </label>
                <span className={`text-[12px] font-mono ${shortBio.length >= 95 ? 'text-[var(--red)] font-bold' : 'text-[var(--muted)]'}`}>
                  {shortBio.length}/100
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={100}
                value={shortBio}
                onChange={e => setShortBio(e.target.value)}
                placeholder="Краткие сведения о кандидате (до 100 символов)..."
                className="w-full bg-[var(--surface)] border border-[var(--field-line)] rounded-[12px] p-3 text-[13px] text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all font-sans resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[var(--ink)]">
                  Кыскача өмүр баяны (KY)
                </label>
                <span className={`text-[12px] font-mono ${shortBioKy.length >= 95 ? 'text-[var(--red)] font-bold' : 'text-[var(--muted)]'}`}>
                  {shortBioKy.length}/100
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={100}
                value={shortBioKy}
                onChange={e => setShortBioKy(e.target.value)}
                placeholder="Талапкер жөнүндө кыскача маалымат (100 белгиге чейин)..."
                className="w-full bg-[var(--surface)] border border-[var(--field-line)] rounded-[12px] p-3 text-[13px] text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all font-sans resize-none"
              />
            </div>
          </div>

          {/* 7. Предвыборная программа (RU & KY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[var(--ink)]">
                  Предвыборная программа (RU)
                </label>
                <span className={`text-[12px] font-mono ${program.length >= 95 ? 'text-[var(--red)] font-bold' : 'text-[var(--muted)]'}`}>
                  {program.length}/100
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={100}
                value={program}
                onChange={e => setProgram(e.target.value)}
                placeholder="Главные тезисы программы (до 100 символов)..."
                className="w-full bg-[var(--surface)] border border-[var(--field-line)] rounded-[12px] p-3 text-[13px] text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all font-sans resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[var(--ink)]">
                  Шайлоо программасы (KY)
                </label>
                <span className={`text-[12px] font-mono ${programKy.length >= 95 ? 'text-[var(--red)] font-bold' : 'text-[var(--muted)]'}`}>
                  {programKy.length}/100
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={100}
                value={programKy}
                onChange={e => setProgramKy(e.target.value)}
                placeholder="Программанын негизги пункттары (100 белгиге чейин)..."
                className="w-full bg-[var(--surface)] border border-[var(--field-line)] rounded-[12px] p-3 text-[13px] text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all font-sans resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-5 flex justify-end gap-3 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              disabled={!modalElectionId || isSaving}
              className="shadow-[var(--shadow-blue-btn)]"
            >
              {editingCandidate ? 'Сохранить изменения' : 'Добавить кандидата'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Candidate Confirmation Modal */}
      <Modal
        isOpen={Boolean(candidateToDelete)}
        onClose={() => setCandidateToDelete(null)}
        title="Удаление кандидата"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3.5 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            Вы действительно хотите удалить кандидата{' '}
            <strong className="text-[var(--ink)] font-bold">«{candidateToDelete?.name}»</strong>?
            Анкета и загруженная фотография будут удалены из системы.
          </p>

          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setCandidateToDelete(null)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={confirmDeleteCandidate}
              isLoading={isDeleting}
            >
              Удалить кандидата
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
