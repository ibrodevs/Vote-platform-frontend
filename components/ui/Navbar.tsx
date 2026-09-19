'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe, Sun, Moon, CheckCircle2, User, Menu, X,
  Shield, ArrowRight, LogIn, ExternalLink, LogOut
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Language } from '@/lib/i18n';

export function Navbar() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>('ru');
  const [isDark, setIsDark] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsStudentLoggedIn(Boolean(sessionStorage.getItem('student_token')));
      setIsAdminLoggedIn(Boolean(localStorage.getItem('admin_token')));
    }

    const savedLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(savedLang);

    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const setLanguage = (newLang: Language) => {
    if (newLang === lang) return;
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
    window.dispatchEvent(new Event('languageChange'));
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'ru' ? 'ky' : 'ru';
    setLanguage(nextLang);
  };

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

  const handleStudentLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('student_token');
      sessionStorage.removeItem('student_data');
      sessionStorage.removeItem('student_university');
      setIsStudentLoggedIn(false);
      window.location.href = '/vote/auth';
    }
  };

  return (
    <header className="gtop w-full border-b border-[var(--line)] bg-[var(--surface)] sticky top-0 z-40">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 md:px-8 h-[56px] sm:h-[62px] flex items-center justify-between gap-2">
        {/* Brand mark & Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/logo.png"
            alt="Dobush.kg Logo"
            className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] object-contain rounded-[8px] transition-transform group-hover:scale-105"
          />
          <span className="text-[18px] sm:text-[20px] font-[800] tracking-[-0.025em] text-[var(--ink)]">
            Dobush<span className="text-[var(--blue)]">.kg</span>
          </span>
        </Link>

        {/* Desktop Controls (md+) */}
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="green" dot={true}>
            {lang === 'ru' ? 'СИСТЕМА АКТИВНА' : 'ТУТУМ АКТИВДҮҮ'}
          </Badge>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="w-[36px] h-[36px] rounded-[10px] bg-[var(--surface)] border border-[var(--field-line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-all cursor-pointer"
            title={isDark ? "Светлая тема" : "Темная тема"}
            aria-label="Сменить тему"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Switcher with Flags (RU / KG) */}
          <div className="inline-flex items-center p-0.5 rounded-[11px] bg-[var(--surface-2)] border border-[var(--field-line)]">
            <button
              type="button"
              onClick={() => setLanguage('ru')}
              className={`inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[9px] text-[12px] font-bold transition-all cursor-pointer ${
                lang === 'ru'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
              title="Русский язык"
            >
              <img src="/flag-ru.svg" alt="RU" className="w-4 h-3 object-cover rounded-[2px] shadow-xs" />
              <span>RU</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ky')}
              className={`inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[9px] text-[12px] font-bold transition-all cursor-pointer ${
                lang === 'ky'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
              title="Кыргыз тили"
            >
              <img src="/flag-kg.svg" alt="KG" className="w-4 h-3 object-cover rounded-[2px] shadow-xs" />
              <span>KG</span>
            </button>
          </div>

          {/* Navigation Controls */}
          {isStudentLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/vote/cabinet">
                <Button variant="secondary" size="sm" className="gap-1.5 border-[var(--blue)]/30 text-[var(--blue)]">
                  <User className="w-3.5 h-3.5" />
                  <span>{lang === 'ru' ? 'Кабинет' : 'Кабинет'}</span>
                </Button>
              </Link>
              <Link href="/vote">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <span>{lang === 'ru' ? 'Выборы' : 'Шайлоолор'}</span>
                </Button>
              </Link>
              <button
                onClick={handleStudentLogout}
                className="inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[10px] bg-[var(--surface)] border border-[var(--line)] text-[12.5px] font-semibold text-[var(--red)] hover:bg-[var(--red-bg)] hover:border-[var(--red)]/30 transition-all cursor-pointer"
                title={lang === 'ru' ? 'Выйти из аккаунта' : 'Кабинеттен чыгуу'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'Выйти' : 'Чыгуу'}</span>
              </button>
            </div>
          ) : (
            <>
              <Link href="/vote/auth">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{lang === 'ru' ? 'Голосование' : 'Добуш берүү'}</span>
                </Button>
              </Link>

              {/* Admin Access (Hidden for students) */}
              <Link href={isAdminLoggedIn ? "/admin/dashboard" : "/admin/login"}>
                <Button variant="primary" size="sm" className="gap-2 shadow-[var(--shadow-blue-btn)]">
                  <span>{lang === 'ru' ? 'Панель управления' : 'Башкаруу панели'}</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Quick Action Strip (<md) */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Quick theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-[34px] h-[34px] rounded-[9px] bg-[var(--surface-2)] border border-[var(--field-line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            aria-label="Тема"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Quick language toggle with flag */}
          <button
            onClick={toggleLanguage}
            className="h-[34px] px-2 rounded-[9px] bg-[var(--surface-2)] border border-[var(--field-line)] flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--ink)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
            aria-label="Язык"
            title={lang === 'ru' ? 'Кыргыз тилине өтүү' : 'Переключить на русский'}
          >
            <img
              src={lang === 'ru' ? '/flag-ru.svg' : '/flag-kg.svg'}
              alt={lang === 'ru' ? 'RU' : 'KG'}
              className="w-4 h-3 object-cover rounded-[2px] shadow-xs"
            />
            <span>{lang === 'ru' ? 'RU' : 'KG'}</span>
          </button>

          {/* If student logged in, quick direct cabinet icon */}
          {isStudentLoggedIn && (
            <Link
              href="/vote/cabinet"
              className="w-[34px] h-[34px] rounded-[9px] bg-[var(--blue-soft)] border border-[var(--blue)]/30 text-[var(--blue)] flex items-center justify-center cursor-pointer"
              title={lang === 'ru' ? 'Личный кабинет' : 'Жеке кабинет'}
            >
              <User className="w-4 h-4" />
            </Link>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-[36px] h-[36px] rounded-[9px] bg-[var(--surface-2)] border border-[var(--field-line)] flex items-center justify-center text-[var(--ink)] hover:bg-[var(--hover)] transition-colors cursor-pointer ml-0.5"
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 space-y-3 shadow-[0_12px_24px_rgba(0,0,0,0.08)] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Status Chip */}
          <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-[12.5px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
              <span className="font-semibold text-[var(--ink)]">
                {lang === 'ru' ? 'Система активна' : 'Тутум активдүү'}
              </span>
            </div>
            <span className="text-[11.5px] text-[var(--muted)]">
              {lang === 'ru' ? 'Шифрование 100%' : 'Шифрлөө 100%'}
            </span>
          </div>

          {/* Mobile Language Switcher with Flags */}
          <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
            <span className="text-[13px] font-semibold text-[var(--ink)]">
              {lang === 'ru' ? 'Язык' : 'Тил'}
            </span>
            <div className="inline-flex items-center p-0.5 rounded-[9px] bg-[var(--surface)] border border-[var(--line)]">
              <button
                type="button"
                onClick={() => setLanguage('ru')}
                className={`inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[7px] text-[12px] font-bold transition-all ${
                  lang === 'ru'
                    ? 'bg-[var(--blue-soft)] text-[var(--blue)] shadow-xs border border-[var(--blue)]/20'
                    : 'text-[var(--muted)]'
                }`}
              >
                <img src="/flag-ru.svg" alt="RU" className="w-4 h-3 object-cover rounded-[2px]" />
                <span>Русский</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ky')}
                className={`inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[7px] text-[12px] font-bold transition-all ${
                  lang === 'ky'
                    ? 'bg-[var(--blue-soft)] text-[var(--blue)] shadow-xs border border-[var(--blue)]/20'
                    : 'text-[var(--muted)]'
                }`}
              >
                <img src="/flag-kg.svg" alt="KG" className="w-4 h-3 object-cover rounded-[2px]" />
                <span>Кыргызча</span>
              </button>
            </div>
          </div>

          {/* Student Logged In Menu */}
          {isStudentLoggedIn ? (
            <div className="space-y-2">
              <Link
                href="/vote/cabinet"
                className="flex items-center justify-between w-full h-[46px] px-4 rounded-[12px] bg-[var(--blue-soft)] border border-[var(--blue)]/25 text-[var(--blue)] font-bold text-[14px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>{lang === 'ru' ? 'Личный кабинет студента' : 'Студенттин жеке кабинети'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/vote"
                className="flex items-center justify-between w-full h-[46px] px-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] font-bold text-[14px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--blue)]" />
                  <span>{lang === 'ru' ? 'Список выборов' : 'Шайлоолор тизмеси'}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--muted)]" />
              </Link>

              <button
                onClick={handleStudentLogout}
                className="flex items-center justify-between w-full h-[46px] px-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] font-bold text-[14px] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  <span>{lang === 'ru' ? 'Выйти из аккаунта' : 'Кабинеттен чыгуу'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/vote/auth"
                className="flex items-center justify-between w-full h-[46px] px-4 rounded-[12px] bg-[var(--blue-soft)] border border-[var(--blue)]/25 text-[var(--blue)] font-bold text-[14px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>{lang === 'ru' ? 'Войти в голосование / Регистрация' : 'Добуш берүүгө кирүү / Катталуу'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={isAdminLoggedIn ? "/admin/dashboard" : "/admin/login"}
                className="flex items-center justify-between w-full h-[46px] px-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] font-bold text-[14px] hover:bg-[var(--hover)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[var(--muted)]" />
                  <span>{lang === 'ru' ? 'Панель управления (Admin)' : 'Башкаруу панели (Admin)'}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--muted)]" />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
