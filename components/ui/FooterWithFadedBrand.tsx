'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/i18n';

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export interface FooterColumn {
  heading: string;
  links: { text: string; url: string; external?: boolean }[];
}

export interface FooterBrandProps {
  lang?: Language;
  brandName?: string;
  tagline?: string;
  columns?: FooterColumn[];
  socials?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    telegram?: string;
  };
  copyright?: string;
  legalLinks?: { text: string; url: string; external?: boolean }[];
  className?: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function FooterWithFadedBrand({
  lang: propLang,
  brandName = 'DOBUSH.KG',
  tagline,
  columns,
  socials = {
    telegram: 'https://t.me/dobush_kg',
    github: 'https://github.com/dobush-kg',
    twitter: 'https://x.com/dobush_kg',
    linkedin: 'https://linkedin.com/company/dobush-kg',
  },
  copyright,
  legalLinks,
  className,
}: FooterBrandProps) {
  const [lang, setLang] = useState<Language>(propLang || 'ru');

  useEffect(() => {
    if (propLang) {
      setLang(propLang);
      return;
    }
    const savedLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(savedLang);

    const onLangChange = () => {
      setLang((localStorage.getItem('app_lang') as Language) || 'ru');
    };
    window.addEventListener('languageChange', onLangChange);
    return () => window.removeEventListener('languageChange', onLangChange);
  }, [propLang]);

  const defaultTagline =
    tagline ||
    (lang === 'ru'
      ? 'ЭЛЕКТРОННОЕ ГОЛОСОВАНИЕ // ТАЙНА И ПРОЗРАЧНОСТЬ'
      : 'ЭЛЕКТРОНДУК ДОБУШ БЕРҮҮ // КУПУЯЛУУЛУК ЖАНА АЧЫКТЫК');

  const defaultColumns: FooterColumn[] = [
    {
      heading: lang === 'ru' ? 'Выборы' : 'Шайлоо',
      links: [
        { text: lang === 'ru' ? 'Главная страница' : 'Башкы бет', url: '/' },
        { text: lang === 'ru' ? 'Активные выборы' : 'Активдүү шайлоолор', url: '/vote' },
        { text: lang === 'ru' ? 'Личный кабинет' : 'Жеке кабинет', url: '/vote/cabinet' },
        { text: lang === 'ru' ? 'Авторизация студента' : 'Студенттин кирүүсү', url: '/vote/auth' },
      ],
    },
    {
      heading: lang === 'ru' ? 'Платформа' : 'Платформа',
      links: [
        { text: lang === 'ru' ? 'Новости и медиа' : 'Жаңылыктар жана медиа', url: '/news' },
        { text: lang === 'ru' ? 'Вопросы и ответы (FAQ)' : 'Суроо-жооптор (FAQ)', url: '/#faq' },
        { text: lang === 'ru' ? 'Реестр университетов' : 'ЖОЖдор тизмеси', url: '/vote' },
        { text: lang === 'ru' ? 'Техподдержка' : 'Техникалык колдоо', url: 'mailto:support@dobush.kg', external: true },
      ],
    },
    {
      heading: lang === 'ru' ? 'Управление' : 'Башкаруу',
      links: [
        { text: lang === 'ru' ? 'Панель администратора' : 'Администратор панели', url: '/admin/dashboard' },
        { text: lang === 'ru' ? 'Мониторинг явки' : 'Катышуу мониторинги', url: '/admin/elections' },
        { text: lang === 'ru' ? 'Вход для комиссии' : 'Комиссия үчүн кирүү', url: '/admin/login' },
      ],
    },
  ];

  const defaultLegalLinks = [
    { text: lang === 'ru' ? 'Регламент голосования' : 'Добуш берүү тартиби', url: '/news' },
    { text: lang === 'ru' ? 'Политика конфиденциальности' : 'Купуялуулук саясаты', url: '/news' },
    { text: lang === 'ru' ? 'Тайна волеизъявления' : 'Эрк билдирүүнүн купуялуулугу', url: '/news' },
  ];

  const currentColumns = columns || defaultColumns;
  const currentLegalLinks = legalLinks || defaultLegalLinks;
  const currentCopyright =
    copyright ||
    (lang === 'ru'
      ? '© 2026 Dobush.kg. Все права защищены.'
      : '© 2026 Dobush.kg. Бардык укуктар корголгон.');

  return (
    <footer
      className={cn(
        'w-full relative overflow-hidden bg-[var(--surface)] border-t border-[var(--line)] select-none transition-colors duration-500',
        className
      )}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 max-w-[1280px] mx-auto px-6 pt-16 pb-8 md:px-12 md:pt-18"
      >
        {/* Tagline */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 mb-10 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)]"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--blue)] shrink-0" />
          <span>{defaultTagline}</span>
        </motion.div>

        {/* Links Grid & Socials */}
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:items-start">
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-3 md:gap-x-16 lg:gap-x-24">
            {currentColumns.map((col, ci) => (
              <motion.div key={ci} variants={itemVariants}>
                <p className="text-[11px] font-bold tracking-widest uppercase mb-4 text-[var(--muted)]">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link, li) => {
                    const isExternal = link.external || link.url.startsWith('mailto:') || link.url.startsWith('http');
                    return (
                      <li key={li}>
                        {isExternal ? (
                          <a
                            href={link.url}
                            target={link.url.startsWith('http') ? '_blank' : undefined}
                            rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-sm font-medium text-[var(--body)] hover:text-[var(--blue)] transition-colors duration-200 inline-block"
                          >
                            {link.text}
                          </a>
                        ) : (
                          <Link
                            href={link.url}
                            className="text-sm font-medium text-[var(--body)] hover:text-[var(--blue)] transition-colors duration-200 inline-block"
                          >
                            {link.text}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Social Icons */}
          <motion.div variants={itemVariants} className="md:text-right">
            <p className="text-[11px] font-bold tracking-widest uppercase mb-4 text-[var(--muted)]">
              {lang === 'ru' ? 'Мы в соцсетях' : 'Биз социалдык тармактарда'}
            </p>
            <div className="flex items-center gap-3 md:justify-end">
              {socials.telegram && (
                <a
                  href={socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] hover:text-white hover:bg-[var(--blue)] hover:border-[var(--blue)] transition-all duration-200 shadow-sm"
                >
                  <TelegramIcon className="w-4 h-4" />
                </a>
              )}
              {socials.github && (
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] hover:text-white hover:bg-[var(--ink)] hover:border-[var(--ink)] transition-all duration-200 shadow-sm"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              )}
              {socials.twitter && (
                <a
                  href={socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] hover:text-white hover:bg-[var(--blue)] hover:border-[var(--blue)] transition-all duration-200 shadow-sm"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
              )}
              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] transition-all duration-200 shadow-sm"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="mt-12 border-t border-[var(--line)]"
        />

        {/* Copyright & Legal Links */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <p className="text-xs text-[var(--muted)]">
            {currentCopyright}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            {currentLegalLinks.map((l, i) => (
              <Link
                key={i}
                href={l.url}
                className="text-xs text-[var(--muted)] hover:text-[var(--blue)] transition-colors"
              >
                {l.text}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Faded Background Brand Name */}
      <motion.p
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="inset-x-0 mt-8 md:mt-12 pb-2 bg-gradient-to-b from-[var(--ink)]/12 via-[var(--ink)]/6 to-transparent bg-clip-text text-center font-[900] tracking-tighter text-transparent select-none pointer-events-none"
        style={{
          fontSize: 'clamp(3rem, 14vw, 12rem)',
          lineHeight: 0.85,
        }}
      >
        {brandName}
      </motion.p>
    </footer>
  );
}

export { FooterWithFadedBrand };
