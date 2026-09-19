'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Vote, Users, GraduationCap, Building2,
  Activity, ShieldCheck, ExternalLink, LogOut,
  Plus, X, ChevronLeft, ChevronRight, School,
  Newspaper, HelpCircle, Sparkles, FileText, ChevronDown
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
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const quickAddRef = useRef<HTMLDivElement>(null);

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

  // Close quick add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setIsQuickAddOpen(false);
      }
    };
    if (isQuickAddOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQuickAddOpen]);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const isSuperAdmin = adminUser?.role === 'super_admin' || adminUser?.is_superuser;
  const isObserver = adminUser?.role === 'observer';

  const triggerCreate = (href: string, entityKey: string) => {
    if (onClose) onClose();
    setIsQuickAddOpen(false);
    if (pathname === href) {
      window.dispatchEvent(new CustomEvent(`admin-create-${entityKey}`));
    } else {
      router.push(`${href}?create=1`);
    }
  };

  const quickAddActions = [
    ...(!isObserver ? [
      {
        title: 'Выборы / Кампания',
        desc: 'Создать новую избирательную кампанию',
        href: '/admin/elections',
        entityKey: 'elections',
        icon: Vote,
      },
      {
        title: 'Кандидат',
        desc: 'Зарегистрировать кандидата',
        href: '/admin/candidates',
        entityKey: 'candidates',
        icon: Users,
      },
    ] : []),
    {
      title: 'Новость',
      desc: 'Опубликовать пресс-релиз или новость',
      href: '/admin/news',
      entityKey: 'news',
      icon: Newspaper,
    },
    ...(!isObserver ? [
      {
        title: 'Реестр студентов',
        desc: 'Импортировать список избирателей',
        href: '/admin/students',
        entityKey: 'students',
        icon: GraduationCap,
      },
    ] : []),
    ...(isSuperAdmin ? [
      {
        title: 'Вопрос и ответ',
        desc: 'Добавить пункт в FAQ',
        href: '/admin/faqs',
        entityKey: 'faqs',
        icon: HelpCircle,
      },
      {
        title: 'Сотрудник вуза',
        desc: 'Создать аккаунт координатора',
        href: '/admin/users',
        entityKey: 'users',
        icon: Users,
      },
      {
        title: 'Университет',
        desc: 'Подключить новый вуз к платформе',
        href: '/admin/universities',
        entityKey: 'universities',
        icon: Building2,
      },
    ] : [])
  ];

  const navGroups = [
    {
      title: 'ОБЗОР',
      items: [
        {
          name: 'Главная панель',
          href: '/admin/dashboard',
          icon: LayoutDashboard,
          badge: null,
          canAdd: false,
          entityKey: '',
          addLabel: ''
        },
        ...(activeElectionId ? [
          {
            name: 'Мониторинг явки',
            href: `/admin/elections/${activeElectionId}/turnout`,
            icon: Activity,
            badge: 'LIVE',
            canAdd: false,
            entityKey: '',
            addLabel: ''
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
          badge: null,
          canAdd: !isObserver,
          entityKey: 'elections',
          addLabel: 'Создать выборы'
        },
        ...(!isObserver ? [
          {
            name: 'Кандидаты',
            href: '/admin/candidates',
            icon: Users,
            badge: null,
            canAdd: true,
            entityKey: 'candidates',
            addLabel: 'Добавить кандидата'
          }
        ] : []),
        {
          name: 'Реестр студентов',
          href: '/admin/students',
          icon: GraduationCap,
          badge: null,
          canAdd: !isObserver,
          entityKey: 'students',
          addLabel: 'Импортировать студентов'
        },
        ...(isSuperAdmin ? [
          {
            name: 'Сотрудники вузов',
            href: '/admin/users',
            icon: Users,
            badge: 'ROOT',
            canAdd: true,
            entityKey: 'users',
            addLabel: 'Добавить сотрудника'
          },
          {
            name: 'Университеты',
            href: '/admin/universities',
            icon: Building2,
            badge: 'ROOT',
            canAdd: true,
            entityKey: 'universities',
            addLabel: 'Добавить университет'
          }
        ] : [])
      ]
    },
    {
      title: 'КОНТЕНТ И САЙТ',
      items: [
        {
          name: 'Новости',
          href: '/admin/news',
          icon: Newspaper,
          badge: null,
          canAdd: true,
          entityKey: 'news',
          addLabel: 'Добавить новость'
        },
        ...(isSuperAdmin ? [
          {
            name: 'Вопросы и ответы',
            href: '/admin/faqs',
            icon: HelpCircle,
            badge: 'ROOT',
            canAdd: true,
            entityKey: 'faqs',
            addLabel: 'Добавить вопрос'
          },
          {
            name: 'Последние выборы',
            href: '/admin/recent-elections',
            icon: Sparkles,
            badge: 'ROOT',
            canAdd: false,
            entityKey: '',
            addLabel: ''
          },
          {
            name: 'Регламенты и документы',
            href: '/admin/legal-pages',
            icon: FileText,
            badge: 'ROOT',
            canAdd: false,
            entityKey: '',
            addLabel: ''
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
            <img
              src="/logo.png"
              alt="Dobush.kg Logo"
              className="w-[30px] h-[30px] object-contain rounded-[8px] shrink-0"
            />
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
            <Badge variant={isSuperAdmin ? 'blue' : isObserver ? 'amber' : 'gray'}>
              {isSuperAdmin ? 'SUPER' : isObserver ? 'НАБЛЮДАТЕЛЬ' : adminUser?.university_details?.code?.toUpperCase() || 'UNI'}
            </Badge>
          </div>
        )}

        {/* Quick Action Button & Popover */}
        {!isObserver && (
          <div className="p-4 border-b border-[var(--line)] relative" ref={quickAddRef}>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsQuickAddOpen(prev => !prev)}
              className={`w-full gap-2 justify-center shadow-[var(--shadow-blue-btn)] ${isCollapsed ? 'px-0' : ''}`}
              title="Создать через боковое меню"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="font-semibold">Создать...</span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 ${isQuickAddOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </Button>

            {/* Quick Add Popover Dropdown */}
            {isQuickAddOpen && (
              <div
                className={`absolute top-[calc(100%-8px)] z-50 bg-[var(--surface)] border border-[var(--line)] rounded-[16px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                  isCollapsed ? 'left-[80px] w-[260px]' : 'left-4 right-4'
                }`}
              >
                <div className="px-3.5 py-2.5 bg-[var(--surface-2)] border-b border-[var(--line)] flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-2)]">
                    Быстрое добавление
                  </span>
                  <span className="text-[10px] text-[var(--blue)] font-bold">БОКОВОЕ МЕНЮ</span>
                </div>
                <div className="p-1.5 space-y-0.5 max-h-[320px] overflow-y-auto">
                  {quickAddActions.map((action, idx) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => triggerCreate(action.href, action.entityKey)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[var(--hover)] text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-[8px] bg-[var(--blue-soft)] text-[var(--blue-soft-text)] flex items-center justify-center shrink-0 group-hover:bg-[var(--blue)] group-hover:text-white transition-colors">
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13.5px] font-semibold text-[var(--ink)] truncate">
                            {action.title}
                          </div>
                          <div className="text-[11px] text-[var(--muted)] truncate">
                            {action.desc}
                          </div>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--blue)] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

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
                    <div key={item.href} className="flex items-center gap-1 group/item">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        title={isCollapsed ? item.name : undefined}
                        className={`flex-1 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-[13px] text-[15px] transition-all duration-150 ${
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

                      {/* Quick + Button on each actionable nav item */}
                      {!isCollapsed && item.canAdd && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            triggerCreate(item.href, item.entityKey);
                          }}
                          title={item.addLabel || 'Добавить через боковое меню'}
                          className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-[var(--blue)] hover:border-transparent border border-[var(--line)] bg-[var(--surface-2)] transition-all cursor-pointer shrink-0 opacity-60 group-hover/item:opacity-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
        variant="center"
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
