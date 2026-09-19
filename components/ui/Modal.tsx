'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'center' | 'drawer';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  variant = 'center'
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (variant === 'drawer') {
    const drawerWidthClasses = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-2xl',
      xl: 'max-w-3xl',
      '2xl': 'max-w-4xl',
    };

    return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-[#141b2a]/50 backdrop-blur-[3px] transition-opacity">
        {/* Backdrop clickable overlay */}
        <div
          className="fixed inset-0 cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Slide-over side panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
          <div
            className={`pointer-events-auto w-screen ${drawerWidthClasses[maxWidth]} bg-[var(--surface)] border-l border-[var(--line)] shadow-2xl flex flex-col h-full z-10 animate-slide-in-right`}
          >
            {/* Drawer Header (Sticky) */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[var(--line)] bg-[var(--surface)] shrink-0 sticky top-0 z-20">
              <div className="pr-4">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--ink)] tracking-tight">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors cursor-pointer shrink-0"
                aria-label="Закрыть боковое меню"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 overscroll-contain">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Classic Center Modal (e.g. for small confirmations)
  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2a]/50 backdrop-blur-[3px] transition-all">
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[var(--surface)] border border-[var(--line)] rounded-[22px] shadow-[var(--shadow-modal)] overflow-hidden z-10 max-h-[90vh] flex flex-col`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[var(--line)] shrink-0 bg-[var(--surface)]">
          <div>
            <h3 className="text-lg font-bold text-[var(--ink)] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors cursor-pointer shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-7 sm:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Drawer(props: Omit<ModalProps, 'variant'>) {
  return <Modal {...props} variant="drawer" />;
}
