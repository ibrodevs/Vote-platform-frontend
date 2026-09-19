'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Vote, Users, GraduationCap, Building2,
  Activity, ShieldCheck, ExternalLink, LogOut,
  Plus, X, ChevronLeft, ChevronRight, School
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeElectionId, setActiveElectionId] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      try {
        setAdminUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    // Try finding active election for instant live turnout shortcut
    api.getAdminElections()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        const active = list.find((e: any) => e.status === 'active');
        if (active) {
          setActiveElectionId(active.id);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const isSuperAdmin = adminUser?.role === 'super_admin';

  const navGroups = [
    {
      title: 'ОБЗОР',
      items: [
        {
          name: 'Главная панель',
          href: '/admin/dashboard',
          icon: LayoutDashboard,
          badge: null
        },
        ...(activeElectionId ? [
          {
            name: 'Мониторинг явки',
            href: `/admin/elections/${activeElectionId}/turnout`,
            icon: Activity,
            badge: 'LIVE'
          }
        ] : [])
      ]
    },
    {
      title: 'УПРАВЛЕНИЕ',
      items: [
        {
          name: 'Выборы',
          href: '/admin/elections',
          icon: Vote,
          badge: null
        },
        {
          name: 'Кандидаты',
          href: '/admin/candidates',
          icon: Users,
          badge: null
        },
        {
          name: 'Реестр студентов',
          href: '/admin/students',
          icon: GraduationCap,
          badge: null
        },
        ...(isSuperAdmin ? [
          {
            name: 'Университеты',
            href: '/admin/universities',
            icon: Building2,
            badge: 'ROOT'
          }
        ] : [])
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#141b2a]/45 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[var(--surface)] border-r border-[var(--line)] flex flex-col transition-[width,transform] duration-250 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-[78px]' : 'lg:w-[300px]'} w-[300px]`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[var(--line)] flex items-center justify-between min-h-[73px]">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[var(--blue)] flex items-center justify-center text-white shrink-0 shadow-[var(--shadow-blue-btn)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            {!isCollapsed && (
              <div className="leading-tight truncate">
                <div className="text-[19px] font-[800] tracking-[-0.02em] text-[var(--ink)]">
                  Dobush<span className="text-[var(--blue)]">.kg</span>
                </div>
                <div className="text-[11px] text-[var(--muted)] font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                  <span>ТЕЛЕМЕТРИЯ 5.0</span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-[8px] border border-[var(--line)] items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
            title={isCollapsed ? "Развернуть панель" : "Свернуть панель"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* University Scope Banner */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)] flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2 text-[var(--muted)] truncate">
              <School className="w-4 h-4 text-[var(--blue)] shrink-0" />
              <span className="truncate font-medium text-[var(--ink)]">
                {adminUser?.university_details?.name || 'Все университеты'}
              </span>
            </div>
            <Badge variant={isSuperAdmin ? 'blue' : 'gray'}>
              {isSuperAdmin ? 'SUPER' : adminUser?.university_details?.code?.toUpperCase() || 'UNI'}
            </Badge>
          </div>
        )}

        {/* Quick Action */}
        <div className="p-4 border-b border-[var(--line)]">
          <Link href="/admin/elections" className="w-full block">
            <Button
              variant="primary"
              size="md"
              className={`w-full gap-2 justify-center shadow-[var(--shadow-blue-btn)] ${isCollapsed ? 'px-0' : ''}`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Создать кампанию</span>}
            </Button>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              {!isCollapsed && (
                <div className="px-3 mb-2.5 text-[11px] font-bold tracking-wider text-[var(--muted-2)] uppercase">
                  {group.title}
                </div>
              )}
              <nav className="space-y-1.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={isCollapsed ? item.name : undefined}
                      className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-[13px] text-[15px] transition-all duration-150 ${
                        isActive
                          ? 'bg-[var(--blue)] text-white font-medium shadow-[var(--shadow-nav-active)]'
                          : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[var(--muted)]'}`} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            item.badge === 'LIVE'
                              ? 'bg-white text-[var(--blue)] animate-pulse'
                              : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Security Guarantee Box */}
          {!isCollapsed && (
            <div className="px-1 pt-2">
              <div className="p-3.5 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] text-xs">
                <div className="flex items-center gap-1.5 text-[var(--ink)] font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-[var(--blue)]" />
                  <span>Защита протокола</span>
                </div>
                <p className="text-[12px] text-[var(--muted)] leading-relaxed">
                  Декуплинг баз: участие избирателей физически изолировано от урны бюллетеней.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Card & Footer */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface)]">
          <div className={`p-2.5 rounded-[15px] border border-[var(--line-strong)] bg-[var(--surface-2)] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'}`}>
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-[42px] h-[42px] rounded-full bg-[var(--blue-soft)] text-[var(--blue-soft-text)] font-bold flex items-center justify-center text-[15px] shrink-0 border border-[var(--blue)]/20 shadow-sm">
                {adminUser?.full_name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="text-[14px] font-bold text-[var(--ink)] truncate">
                    {adminUser?.full_name || 'Администратор'}
                  </div>
                  <div className="text-[12px] text-[var(--muted)] truncate">
                    {adminUser?.email || 'admin@dobush.kg'}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-[10px] text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--red-bg)] transition-colors cursor-pointer"
                title="Выйти из системы"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-3 pt-2.5 border-t border-[var(--line)] flex items-center justify-between text-[11.5px] text-[var(--muted-2)]">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1 text-[var(--muted)] hover:text-[var(--blue)] transition-colors"
              >
                <span>Публичный портал</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <span className="font-mono">v5.0 CRM</span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (<= 760px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[72px] bg-[var(--surface)] border-t border-[var(--line)] px-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {navGroups.flatMap(g => g.items).slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-[12px] transition-all ${
                isActive ? 'text-[var(--blue)] font-bold' : 'text-[var(--muted)]'
              }`}
            >
              <Icon className="w-[20px] h-[20px]" />
              <span className="text-[11px] mt-1 font-medium truncate max-w-[65px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Выход из панели управления"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            Вы действительно хотите завершить административную сессию и выйти из системы?
          </p>
          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={confirmLogout}
            >
              Выйти
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
