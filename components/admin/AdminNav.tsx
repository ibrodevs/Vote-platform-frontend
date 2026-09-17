'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, School, Users, Vote, UserCheck,
} from 'lucide-react';

interface AdminNavProps {
  userRole?: string;
  universityCode?: string;
}

export function AdminNav({ userRole = 'university_admin' }: AdminNavProps) {
  const pathname = usePathname();

  const links = [
    { href: '/admin/dashboard', label: 'Дашборд', icon: LayoutDashboard },
    ...(userRole === 'super_admin' ? [
      { href: '/admin/universities', label: 'Вузы', icon: School },
    ] : []),
    { href: '/admin/elections', label: 'Выборы', icon: Vote },
    { href: '/admin/candidates', label: 'Кандидаты', icon: UserCheck },
    { href: '/admin/students', label: 'Реестр студентов', icon: Users },
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
      {links.map(link => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-2 h-[42px] px-4 rounded-[12px] text-[13.5px] font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-[var(--blue)] text-white shadow-[var(--shadow-blue-btn)]'
                : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--field-line)] hover:bg-[var(--hover)] hover:border-[var(--line-strong)]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--muted)]'}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
