'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-[var(--line)] bg-[var(--surface)] py-8 text-[13px] text-[var(--muted)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--blue)]" />
            <span className="text-[12px] uppercase tracking-wider text-[var(--ink)] font-bold">
              DOBUSH.KG // ARCHITECTURE SPEC 5.0
            </span>
          </div>
          <div className="text-[var(--muted)] text-center md:text-left text-[13px]">
            Физическое разделение реестра явки (<code className="text-[var(--blue)] font-mono">VoteRecord</code>) и бюллетеней (<code className="text-[var(--blue)] font-mono">Ballot</code>) на уровне базы данных.
          </div>
          <div className="text-[12px] text-[var(--muted-2)]">
            © 2026 Dobush.kg. Все права защищены.
          </div>
        </div>
      </footer>
    </>
  );
}
