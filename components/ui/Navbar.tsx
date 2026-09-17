'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe, Sun, Moon, CheckCircle2, User, Menu, X,
  Shield, ArrowRight, LogIn, ExternalLink
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

  const toggleLanguage = () => {
    const nextLang = lang === 'ru' ? 'ky' : 'ru';
    setLang(nextLang);
    localStorage.setItem('app_lang', nextLang);
    window.dispatchEvent(new Event('languageChange'));
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

  return (
    <header className="gtop w-full border-b border-[var(--line)] bg-[var(--surface)] sticky top-0 z-40">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 md:px-8 h-[56px] sm:h-[62px] flex items-center justify-between gap-2">
        {/* Brand mark & Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-[9px] bg-[var(--blue)] flex items-center justify-center text-white shadow-[var(--shadow-blue-btn)] transition-transform group-hover:scale-105">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="text-[18px] sm:text-[20px] font-[800] tracking-[-0.025em] text-[var(--ink)]">
            Vote <span className="text-[var(--blue)]">CRM</span>
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

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[10px] bg-[var(--surface)] border border-[var(--field-line)] text-[12.5px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-all cursor-pointer"
            title="Тилди которуу / Сменить язык"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--blue)]" />
            <span>{lang === 'ru' ? 'КЫР' : 'РУС'}</span>
          </button>

          {/* Student Access */}
          {isStudentLoggedIn ? (
            <Link href="/vote/cabinet">
              <Button variant="secondary" size="sm" className="gap-1.5 border-[var(--blue)]/30 text-[var(--blue)]">
                <User className="w-3.5 h-3.5" />
                <span>Кабинет</span>
              </Button>
            </Link>
          ) : (
            <Link href="/vote/auth">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Голосование</span>
              </Button>
            </Link>
          )}

          {/* Admin Access */}
          <Link href={isAdminLoggedIn ? "/admin/dashboard" : "/admin/login"}>
            <Button variant="primary" size="sm" className="gap-2 shadow-[var(--shadow-blue-btn)]">
              <span>Панель управления</span>
            </Button>
          </Link>
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

          {/* Quick language toggle */}
          <button
            onClick={toggleLanguage}
            className="h-[34px] px-2 rounded-[9px] bg-[var(--surface-2)] border border-[var(--field-line)] text-[11.5px] font-bold text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            aria-label="Язык"
          >
            {lang === 'ru' ? 'KG' : 'RU'}
          </button>

          {/* If student logged in, quick direct cabinet icon */}
          {isStudentLoggedIn && (
            <Link
              href="/vote/cabinet"
              className="w-[34px] h-[34px] rounded-[9px] bg-[var(--blue-soft)] border border-[var(--blue)]/30 text-[var(--blue)] flex items-center justify-center cursor-pointer"
              title="Личный кабинет"
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
              Шифрование 100%
            </span>
          </div>

          {/* Student Cabinet / Voting Link */}
          <div>
            {isStudentLoggedIn ? (
              <Link
                href="/vote/cabinet"
                className="flex items-center justify-between w-full h-[46px] px-4 rounded-[12px] bg-[var(--blue-soft)] border border-[var(--blue)]/25 text-[var(--blue)] font-bold text-[14px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Личный кабинет студента</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/vote/auth"
                className="flex items-center justify-between w-full h-[46px] px-4 rounded-[12px] bg-[var(--blue-soft)] border border-[var(--blue)]/25 text-[var(--blue)] font-bold text-[14px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Войти в голосование / Регистрация</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Admin Panel Link */}
          <div>
            <Link
              href={isAdminLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center justify-between w-full h-[46px] px-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] font-bold text-[14px] hover:bg-[var(--hover)] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[var(--muted)]" />
                <span>Панель управления (Admin)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--muted)]" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
