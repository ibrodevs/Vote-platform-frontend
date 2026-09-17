'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, ArrowLeft, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('app_theme', 'light');
    }
  };

  const fillDemo = (role: 'super' | 'kstu') => {
    if (role === 'super') {
      setEmail('admin@vote.kg');
      setPassword('adminpassword123');
    } else {
      setEmail('kstu_admin@vote.kg');
      setPassword('adminpassword123');
    }
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Введите email и пароль');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.adminLogin({ email, password });
      localStorage.setItem('admin_token', response.access);
      localStorage.setItem('admin_refresh', response.refresh);
      localStorage.setItem('admin_user', JSON.stringify(response.user));

      router.push('/admin/dashboard');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Неверный логин или пароль');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Top bar controls */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться на портал</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="w-[38px] h-[38px] rounded-[10px] bg-[var(--surface)] border border-[var(--field-line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] transition-all cursor-pointer"
            title="Сменить тему"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-[44px] h-[44px] rounded-[12px] bg-[var(--blue)] text-white flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-blue-btn)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-[28px] font-[800] text-[var(--ink)] tracking-tight mb-2">
            Vote <span className="text-[var(--blue)]">CRM</span>
          </h1>
          <p className="text-[14px] text-[var(--muted)]">
            Авторизация избирательной комиссии и супер-администратора
          </p>
        </div>

        {/* Login Card */}
        <div className="crm-card p-7 sm:p-9 shadow-[var(--shadow-modal)]">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
                Электронная почта
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@vote.kg"
                  className="crm-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
              Войти в CRM
            </Button>
          </form>

          {/* Demo fill shortcuts */}
          <div className="mt-8 pt-6 border-t border-[var(--line)]">
            <span className="block text-[12px] font-semibold text-[var(--muted)] mb-3 text-center uppercase tracking-wider">
              Быстрый вход для тестирования:
            </span>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => fillDemo('super')}
                className="w-full h-[44px] px-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-[13.5px] text-[var(--ink)] hover:border-[var(--blue)] hover:bg-[var(--hover)] transition-all flex items-center justify-between cursor-pointer font-medium"
              >
                <span>Супер-администратор</span>
                <span className="text-[12px] text-[var(--muted)] font-mono">admin@vote.kg</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('kstu')}
                className="w-full h-[44px] px-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-[13.5px] text-[var(--ink)] hover:border-[var(--blue)] hover:bg-[var(--hover)] transition-all flex items-center justify-between cursor-pointer font-medium"
              >
                <span>Администратор КГТУ</span>
                <span className="text-[12px] text-[var(--muted)] font-mono">kstu_admin@vote.kg</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
