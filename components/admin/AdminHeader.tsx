'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ExternalLink, Sun, Moon, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
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

  const getBreadcrumbs = () => {
    if (pathname.includes('/turnout')) return { section: 'Выборы', page: 'Онлайн явка' };
    if (pathname.includes('/results')) return { section: 'Выборы', page: 'Итоговый протокол' };
    if (pathname.startsWith('/admin/dashboard')) return { section: 'Консоль', page: 'Главная панель' };
    if (pathname.startsWith('/admin/elections')) return { section: 'Управление', page: 'Выборы' };
    if (pathname.startsWith('/admin/candidates')) return { section: 'Управление', page: 'Кандидаты' };
    if (pathname.startsWith('/admin/students')) return { section: 'Управление', page: 'Реестр студентов' };
    if (pathname.startsWith('/admin/users')) return { section: 'Система', page: 'Сотрудники вузов' };
    if (pathname.startsWith('/admin/universities')) return { section: 'Система', page: 'Университеты' };
    return { section: 'CRM Консоль', page: 'Обзор' };
  };

  const { section, page } = getBreadcrumbs();

  return (
    <header className="gtop w-full px-4 sm:px-9 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-[10px] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] lg:hidden cursor-pointer"
          title="Открыть меню"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-[var(--muted)] hidden sm:inline">{section}</span>
          <span className="text-[var(--faint)] hidden sm:inline">/</span>
          <span className="text-[var(--ink)] font-bold">{page}</span>
        </div>
      </div>

      {/* Right status, search & theme toggle */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="green" dot={true}>
            СЕРВЕР: АКТИВЕН
          </Badge>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-[38px] h-[38px] rounded-[10px] bg-[var(--surface)] border border-[var(--field-line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-all cursor-pointer"
          title={isDark ? "Светлая тема" : "Темная тема"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Public portal link */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-[10px] border border-[var(--field-line)] text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-all bg-[var(--surface)] shadow-sm"
        >
          <span className="hidden sm:inline">Портал</span>
          <ExternalLink className="w-3.5 h-3.5 text-[var(--blue)]" />
        </Link>
      </div>
    </header>
  );
}
