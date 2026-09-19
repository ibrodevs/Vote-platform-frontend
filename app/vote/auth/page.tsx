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

  const [lang, setLang] = useState<'ru' | 'ky'>('ru');
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [universities, setUniversities] = useState<any[]>([]);
  const [electionInfo, setElectionInfo] = useState<any>(null);

  useEffect(() => {
    const currentLang = (localStorage.getItem('app_lang') as 'ru' | 'ky') || 'ru';
    setLang(currentLang);

    const onLangChange = () => {
      setLang((localStorage.getItem('app_lang') as 'ru' | 'ky') || 'ru');
    };
    window.addEventListener('languageChange', onLangChange);
    return () => window.removeEventListener('languageChange', onLangChange);
  }, []);

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

  const t = {
    backToHome: lang === 'ru' ? 'На главную' : 'Башкы бетке',
    voterPortal: lang === 'ru' ? 'ПОРТАЛ ИЗБИРАТЕЛЯ' : 'ШАЙЛООЧУ ПОРТАЛЫ',
    voteByLink: lang === 'ru' ? 'Голосование по ссылке:' : 'Шилтеме боюнча добуш берүү:',
    studentCabinet: lang === 'ru' ? 'Личный кабинет студента' : 'Студенттин жеке кабинети',
    registerSubtitle: lang === 'ru' ? 'Зарегистрируйтесь для участия в студенческих выборах' : 'Студенттик шайлоого катышуу үчүн катталыңыз',
    loginSubtitle: lang === 'ru' ? 'Войдите в свой профиль по email и паролю' : 'Email жана сырсөзүңүз аркылуу профилиңизге кириңиз',
    tabRegister: lang === 'ru' ? 'Регистрация' : 'Катталуу',
    tabLogin: lang === 'ru' ? 'Вход' : 'Кирүү',
    closed: lang === 'ru' ? 'Закрыта' : 'Жабык',
    regClosedTitle: lang === 'ru' ? 'Регистрация новых студентов закрыта' : 'Жаңы студенттерди каттоо жабылган',
    regClosedDesc: (uniName: string) => lang === 'ru'
      ? `Администрация университета ${uniName} временно приостановила регистрацию новых избирателей. Если у вас уже есть аккаунт, перейдите на вкладку «Вход».`
      : `${uniName} университетинин администрациясы жаңы шайлоочуларды каттоону убактылуу токтотту. Эгер сизде каттоо эсеби болсо, «Кирүү» өтмөгүнө өтүңүз.`,
    goToLogin: lang === 'ru' ? 'Перейти ко входу по email и паролю →' : 'Email жана сырсөз аркылуу кирүүгө өтүү →',
    fullNameLabel: lang === 'ru' ? 'ФИО студента *' : 'Студенттин аты-жөнү *',
    fullNamePlaceholder: 'Азамат Исаков',
    universityLabel: lang === 'ru' ? 'Университет *' : 'Университет *',
    courseLabel: lang === 'ru' ? 'Курс *' : 'Курс *',
    courseOption: (n: number) => lang === 'ru' ? `${n} курс` : `${n}-курс`,
    groupLabel: lang === 'ru' ? 'Группа *' : 'Топ *',
    groupPlaceholder: 'ПИ-1-21',
    emailLabel: lang === 'ru' ? 'Электронная почта *' : 'Электрондук почта *',
    passwordLabel: lang === 'ru' ? 'Пароль *' : 'Сырсөз *',
    passwordPlaceholder: lang === 'ru' ? 'Минимум 6 символов' : 'Кеминде 6 белги',
    registerClosedBtn: lang === 'ru' ? 'Регистрация закрыта' : 'Каттоо жабык',
    registerBtn: lang === 'ru' ? 'Зарегистрироваться и продолжить' : 'Катталуу жана улантуу',
    loginBtn: lang === 'ru' ? 'Войти в кабинет' : 'Кабинетке кирүү',
    alreadyHaveAccount: lang === 'ru' ? 'Уже есть аккаунт?' : 'Каттоо эсебиңиз барбы?',
    loginLink: lang === 'ru' ? 'Войти' : 'Кирүү',
    noAccountYet: lang === 'ru' ? 'Еще нет аккаунта?' : 'Каттоо эсебиңиз жокпу?',
    registerLink: lang === 'ru' ? 'Зарегистрироваться' : 'Катталуу',
    loading: lang === 'ru' ? 'Загрузка...' : 'Жүктөлүүдө...',
    errorFillAll: lang === 'ru' ? 'Пожалуйста, заполните все обязательные поля' : 'Бардык талап кылынган талааларды толтуруңуз',
    errorRegClosed: lang === 'ru' ? 'Регистрация новых студентов в выбранном университете закрыта администратором. Вы можете войти в существующий аккаунт.' : 'Тандалган университетте жаңы студенттерди каттоо жабылган. Сиз болгон аккаунтуңузга кире аласыз.',
    errorRegFailed: lang === 'ru' ? 'Ошибка при регистрации. Проверьте введенные данные.' : 'Каттоодо ката кетти. Маалыматтарды текшериңиз.',
    errorEnterCredentials: lang === 'ru' ? 'Введите email и пароль' : 'Email жана сырсөздү киргизиңиз',
    errorInvalidCredentials: lang === 'ru' ? 'Неверный email или пароль' : 'Email же сырсөз туура эмес',
  };

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
      setErrorMsg(t.errorRegClosed);
      return;
    }

    if (!fullName.trim() || !selectedUniversityId || !group.trim() || !email.trim() || !password) {
      setErrorMsg(t.errorFillAll);
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
        setErrorMsg(t.errorRegFailed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg(t.errorEnterCredentials);
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
        setErrorMsg(t.errorInvalidCredentials);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const uniDisplayName = currentSelectedUni ? (lang === 'ky' && currentSelectedUni.name_ky ? currentSelectedUni.name_ky : currentSelectedUni.name) : '';

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
            <span>{t.backToHome}</span>
          </Link>
          <Badge variant="blue" dot={true}>
            {t.voterPortal}
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
                {t.voteByLink}
              </div>
              <div className="text-[15px] font-bold text-[var(--ink)]">
                {lang === 'ky' && electionInfo.title_ky ? electionInfo.title_ky : electionInfo.title}
              </div>
              <div className="text-[12px] text-[var(--muted)]">
                {lang === 'ky' && electionInfo.university_details?.name_ky ? electionInfo.university_details.name_ky : electionInfo.university_details?.name}
              </div>
            </div>
          </div>
        )}

        {/* Main Auth Card */}
        <div className="crm-card p-7 sm:p-9 shadow-[var(--shadow-modal)]">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-[52px] h-[52px] mx-auto mb-3 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Dobush.kg Logo"
                className="w-[52px] h-[52px] object-contain rounded-[12px]"
              />
            </div>
            <h1 className="text-[24px] font-[800] text-[var(--ink)] tracking-tight mb-1">
              {t.studentCabinet}
            </h1>
            <p className="text-[13.5px] text-[var(--muted)]">
              {mode === 'register' ? t.registerSubtitle : t.loginSubtitle}
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
              <span>{t.tabRegister}</span>
              {isRegistrationClosed && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-[5px] bg-[var(--red-bg)] text-[var(--red)] border border-[var(--red)]/20">
                  {t.closed}
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
              {t.tabLogin}
            </button>
          </div>

          {/* Registration Closed Warning Banner */}
          {isRegistrationClosed && mode === 'register' && (
            <div className="mb-5 p-4 rounded-[14px] bg-[var(--amber-bg)] border border-[var(--amber)]/30 text-[var(--amber)] text-[13px] space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-[14px]">
                <Lock className="w-4 h-4 shrink-0" />
                <span>{t.regClosedTitle}</span>
              </div>
              <p className="leading-relaxed">
                {t.regClosedDesc(uniDisplayName)}
              </p>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className="font-bold gap-1.5 shadow-xs"
                >
                  {t.goToLogin}
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
                  {t.fullNameLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="crm-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  {t.universityLabel}
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
                        {(lang === 'ky' && u.name_ky ? u.name_ky : u.name)} ({u.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                    {t.courseLabel}
                  </label>
                  <select
                    value={course}
                    onChange={e => setCourse(Number(e.target.value))}
                    className="crm-input font-medium"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6].map(c => (
                      <option key={c} value={c}>
                        {t.courseOption(c)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                    {t.groupLabel}
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                      type="text"
                      value={group}
                      onChange={e => setGroup(e.target.value)}
                      placeholder={t.groupPlaceholder}
                      className="crm-input pl-10 uppercase"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  {t.emailLabel}
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
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
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
                {isRegistrationClosed ? t.registerClosedBtn : t.registerBtn}
              </Button>
            </form>
          )}

          {/* TAB 2: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  {t.emailLabel}
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
                  {t.passwordLabel}
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
                {t.loginBtn}
              </Button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-8 pt-5 border-t border-[var(--line)] text-center">
            <span className="text-[12px] text-[var(--muted)]">
              {mode === 'register' ? (
                <>{t.alreadyHaveAccount} <button type="button" onClick={() => setMode('login')} className="text-[var(--blue)] font-bold hover:underline cursor-pointer">{t.loginLink}</button></>
              ) : (
                <>{t.noAccountYet} <button type="button" onClick={() => setMode('register')} className="text-[var(--blue)] font-bold hover:underline cursor-pointer">{t.registerLink}</button></>
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
        <div className="text-[14px] text-[var(--muted)]">Жүктөлүүдө...</div>
      </div>
    }>
      <StudentAuthContent />
    </Suspense>
  );
}
