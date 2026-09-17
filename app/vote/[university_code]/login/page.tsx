'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, KeyRound, Phone, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api, ApiError } from '@/lib/api';
import { translations, Language } from '@/lib/i18n';

export default function StudentLoginPage() {
  const params = useParams();
  const router = useRouter();
  const uniCode = String(params.university_code || '').toLowerCase();

  const [lang, setLang] = useState<Language>('ru');
  const [studentId, setStudentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    router.replace(`/vote/auth?university=${uniCode}&mode=login`);
  }, [router, uniCode]);

  const t = translations[lang];

  // Fill quick demo credentials
  const fillDemoData = () => {
    if (uniCode === 'kstu') {
      setStudentId('2024001');
      setPhoneNumber('+996700111001');
    } else {
      setStudentId('AUCA001');
      setPhoneNumber('+996555111222');
    }
    setErrorMsg('');
  };

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentId.trim() || !phoneNumber.trim()) {
      setErrorMsg(lang === 'ru' ? 'Заполните все обязательные поля' : 'Бардык талааларды толтуруңуз');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.studentIdentify({
        university_code: uniCode,
        student_id: studentId.trim(),
        phone_number: phoneNumber.trim()
      });

      // Save student info temporarily in sessionStorage for context
      sessionStorage.setItem('pending_student_id', studentId.trim());
      sessionStorage.setItem('pending_phone', phoneNumber.trim());
      if (response.demo_code) {
        sessionStorage.setItem('demo_otp', response.demo_code);
      }

      router.push(`/vote/${uniCode}/verify?request_id=${response.request_id}`);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(lang === 'ru' ? 'Ошибка соединения с сервером' : 'Сервер менен байланыш катасы');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Top return link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/vote/${uniCode}`}
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{uniCode.toUpperCase()}</span>
          </Link>
          <Badge variant="blue">
            ШАГ 1 ИЗ 2
          </Badge>
        </div>

        {/* Login Card */}
        <div className="crm-card p-7 sm:p-9 shadow-[var(--shadow-modal)]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-[14px] bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] mx-auto mb-3.5">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-[22px] font-[800] text-[var(--ink)] tracking-tight mb-1.5">
              {t.auth_title}
            </h1>
            <p className="text-[13.5px] text-[var(--muted)]">
              {t.auth_subtitle}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleIdentify} className="space-y-4">
            {/* Student ID field */}
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
                {t.student_id_label}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="text"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder={t.student_id_placeholder}
                  className="crm-input pl-10 font-mono"
                  required
                />
              </div>
            </div>

            {/* Phone Number field */}
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2">
                {t.phone_label}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder={t.phone_placeholder}
                  className="crm-input pl-10 font-mono"
                  required
                />
              </div>
            </div>

            {/* Quick Demo Test Autofill */}
            <div className="pt-1">
              <button
                type="button"
                onClick={fillDemoData}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--blue)] transition-colors cursor-pointer"
              >
                <span className="text-[var(--blue)]">⚡</span>
                <span>{lang === 'ru' ? 'Заполнить демо-студента' : 'Демо толтуруу'}</span>
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full justify-center mt-3 text-[15px]"
            >
              {isLoading ? t.sending_code : t.send_code_btn}
            </Button>
          </form>

          {/* Privacy footer */}
          <div className="mt-8 pt-5 border-t border-[var(--line)] text-center">
            <p className="text-[12px] text-[var(--muted)] leading-relaxed">
              <Shield className="w-3.5 h-3.5 text-[var(--blue)] inline mr-1" />
              {t.ballot_note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
