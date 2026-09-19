'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Lock, School, GraduationCap, Users,
  AlertCircle, ArrowLeft, CheckCircle2, Vote
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api, ApiError } from '@/lib/api';

function StudentAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetElectionId = searchParams.get('election') || '';

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [universities, setUniversities] = useState<any[]>([]);
  const [electionInfo, setElectionInfo] = useState<any>(null);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [facultiesList, setFacultiesList] = useState<any[]>([]);
  const [faculty, setFaculty] = useState('');
  const [course, setCourse] = useState<number>(1);
  const [group, setGroup] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const uniParam = searchParams.get('university') || searchParams.get('university_id') || searchParams.get('uni');

    // Load active universities
    api.getUniversities()
      .then(list => {
        const active = (list || []).filter((u: any) => u.is_active);
        setUniversities(active);

        let initialUniId = '';
        if (uniParam) {
          const matched = active.find((u: any) => u.id === uniParam || u.code === uniParam.toLowerCase());
          if (matched) initialUniId = matched.id;
        }

        if (!initialUniId && active.length > 0) {
          initialUniId = active[0].id;
        }

        if (initialUniId && !selectedUniversityId) {
          setSelectedUniversityId(initialUniId);
        }
      })
      .catch(() => {});

    // If target election is specified, fetch its info to pre-select university
    if (targetElectionId) {
      api.getElectionDetail(targetElectionId)
        .then(elec => {
          setElectionInfo(elec);
          if (elec?.university) {
            setSelectedUniversityId(elec.university);
          }
        })
        .catch(() => {});
    }

    const queryMode = searchParams.get('mode');
    if (queryMode === 'login') {
      setMode('login');
    }
  }, [targetElectionId, searchParams]);

  // When university changes, load its faculties
  useEffect(() => {
    if (!selectedUniversityId) {
      setFacultiesList([]);
      setFaculty('');
      return;
    }

    const currentUni = universities.find(u => u.id === selectedUniversityId);
    if (currentUni && Array.isArray(currentUni.faculties) && currentUni.faculties.length > 0) {
      setFacultiesList(currentUni.faculties);
      setFaculty('');
    } else {
      api.getUniversityFaculties(selectedUniversityId)
        .then(facs => {
          const list = Array.isArray(facs) ? facs : ((facs as any)?.results || []);
          setFacultiesList(list);
          setFaculty('');
        })
        .catch(() => {
          setFacultiesList([]);
          setFaculty('');
        });
    }
  }, [selectedUniversityId, universities]);

  const currentSelectedUni = universities.find(u => u.id === selectedUniversityId);
  const isRegistrationClosed = currentSelectedUni ? currentSelectedUni.is_registration_open === false : false;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegistrationClosed) {
      setErrorMsg('Регистрация новых студентов в выбранном университете закрыта администратором. Вы можете войти в существующий аккаунт.');
      return;
    }

    if (!fullName.trim() || !selectedUniversityId || !group.trim() || !email.trim() || !password) {
      setErrorMsg('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.studentRegister({
        full_name: fullName.trim(),
        university_id: selectedUniversityId,
        faculty: faculty.trim(),
        course: Number(course),
        group: group.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      // Save student session
      sessionStorage.setItem('student_token', res.student_token);
      sessionStorage.setItem('student_data', JSON.stringify(res.student));
      sessionStorage.setItem('student_university', JSON.stringify(res.university));

      if (targetElectionId) {
        router.push(`/vote/elections/${targetElectionId}`);
      } else {
        router.push('/vote/cabinet');
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ошибка при регистрации. Проверьте введенные данные.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Введите email и пароль');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.studentPasswordLogin({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword
      });

      // Save student session
      sessionStorage.setItem('student_token', res.student_token);
      sessionStorage.setItem('student_data', JSON.stringify(res.student));
      sessionStorage.setItem('student_university', JSON.stringify(res.university));

      if (targetElectionId) {
        router.push(`/vote/elections/${targetElectionId}`);
      } else {
        router.push('/vote/cabinet');
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Неверный email или пароль');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        {/* Top return link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>На главную</span>
          </Link>
          <Badge variant="blue" dot={true}>
            ПОРТАЛ ИЗБИРАТЕЛЯ
          </Badge>
        </div>

        {/* Election Invitation Banner (if came via direct voting link) */}
        {electionInfo && (
          <div className="mb-6 p-4 rounded-[14px] bg-[var(--blue-soft)] border border-[var(--blue)]/20 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--blue)] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-bold text-[var(--blue)] tracking-wider">
                Голосование по ссылке:
              </div>
              <div className="text-[15px] font-bold text-[var(--ink)]">
                {electionInfo.title}
              </div>
              <div className="text-[12px] text-[var(--muted)]">
                {electionInfo.university_details?.name}
              </div>
            </div>
          </div>
        )}

        {/* Main Auth Card */}
        <div className="crm-card p-7 sm:p-9 shadow-[var(--shadow-modal)]">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-[14px] bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-[24px] font-[800] text-[var(--ink)] tracking-tight mb-1">
              Личный кабинет студента
            </h1>
            <p className="text-[13.5px] text-[var(--muted)]">
              {mode === 'register'
                ? 'Зарегистрируйтесь для участия в студенческих выборах'
                : 'Войдите в свой профиль по email и паролю'
              }
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-[var(--surface-2)] rounded-[12px] border border-[var(--line)] mb-6">
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 h-[38px] rounded-[10px] text-[13.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <span>Регистрация</span>
              {isRegistrationClosed && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-[5px] bg-[var(--red-bg)] text-[var(--red)] border border-[var(--red)]/20">
                  Закрыта
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 h-[38px] rounded-[10px] text-[13.5px] font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Вход
            </button>
          </div>

          {/* Registration Closed Warning Banner */}
          {isRegistrationClosed && mode === 'register' && (
            <div className="mb-5 p-4 rounded-[14px] bg-[var(--amber-bg)] border border-[var(--amber)]/30 text-[var(--amber)] text-[13px] space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-[14px]">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Регистрация новых студентов закрыта</span>
              </div>
              <p className="leading-relaxed">
                Администрация университета <strong>{currentSelectedUni?.name}</strong> временно приостановила регистрацию новых избирателей.
                Если у вас уже есть аккаунт, перейдите на вкладку <strong>«Вход»</strong>.
              </p>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className="font-bold gap-1.5 shadow-xs"
                >
                  Перейти ко входу по email и паролю →
                </Button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: REGISTRATION */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  ФИО студента *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Азамат Исаков"
                    className="crm-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  Университет *
                </label>
                <div className="relative">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <select
                    value={selectedUniversityId}
                    onChange={e => setSelectedUniversityId(e.target.value)}
                    className="crm-input pl-10 font-medium"
                    required
                  >
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                    Курс *
                  </label>
                  <select
                    value={course}
                    onChange={e => setCourse(Number(e.target.value))}
                    className="crm-input font-medium"
                    required
                  >
                    <option value="1">1 курс</option>
                    <option value="2">2 курс</option>
                    <option value="3">3 курс</option>
                    <option value="4">4 курс</option>
                    <option value="5">5 курс</option>
                    <option value="6">6 курс</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                    Группа *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                      type="text"
                      value={group}
                      onChange={e => setGroup(e.target.value)}
                      placeholder="ПИ-1-21"
                      className="crm-input pl-10 uppercase"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  Электронная почта *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@university.kg"
                    className="crm-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  Пароль *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    className="crm-input pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant={isRegistrationClosed ? 'secondary' : 'primary'}
                size="md"
                isLoading={isLoading}
                disabled={isRegistrationClosed || isLoading}
                className={`w-full justify-center mt-2 text-[15px] ${isRegistrationClosed ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isRegistrationClosed ? 'Регистрация закрыта' : 'Зарегистрироваться и продолжить'}
              </Button>
            </form>
          )}

          {/* TAB 2: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  Электронная почта
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="student@university.kg"
                    className="crm-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="crm-input pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center mt-2 text-[15px]"
              >
                Войти в кабинет
              </Button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-8 pt-5 border-t border-[var(--line)] text-center">
            <span className="text-[12px] text-[var(--muted)]">
              {mode === 'register' ? (
                <>Уже есть аккаунт? <button type="button" onClick={() => setMode('login')} className="text-[var(--blue)] font-bold hover:underline cursor-pointer">Войти</button></>
              ) : (
                <>Еще нет аккаунта? <button type="button" onClick={() => setMode('register')} className="text-[var(--blue)] font-bold hover:underline cursor-pointer">Зарегистрироваться</button></>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="text-[14px] text-[var(--muted)]">Загрузка...</div>
      </div>
    }>
      <StudentAuthContent />
    </Suspense>
  );
}
