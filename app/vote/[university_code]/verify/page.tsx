'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Smartphone, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api, ApiError } from '@/lib/api';
import { translations, Language } from '@/lib/i18n';

function VerifyContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const uniCode = String(params.university_code || '').toLowerCase();
  const requestId = searchParams.get('request_id') || '';

  const [lang, setLang] = useState<Language>('ru');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [demoOtp, setDemoOtp] = useState('123456');

  useEffect(() => {
    const currentLang = (localStorage.getItem('app_lang') as Language) || 'ru';
    setLang(currentLang);

    const savedOtp = sessionStorage.getItem('demo_otp');
    if (savedOtp) setDemoOtp(savedOtp);

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const t = translations[lang];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim()) {
      setErrorMsg(lang === 'ru' ? 'Введите проверочный код' : 'Текшерүү кодун киргизиңиз');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.studentVerify({
        request_id: requestId,
        code: code.trim()
      });

      // Save student token
      sessionStorage.setItem('student_token', response.student_token);
      sessionStorage.setItem('student_data', JSON.stringify(response.student));
      sessionStorage.setItem('student_university', JSON.stringify(response.university));

      router.push(`/vote/${uniCode}/elections`);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(lang === 'ru' ? 'Неверный код или ошибка сервера' : 'Ката код же сервер катасы');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Top link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/vote/${uniCode}/login`}
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Изменить данные</span>
          </Link>
          <Badge variant="blue">
            ШАГ 2 ИЗ 2
          </Badge>
        </div>

        <div className="crm-card p-7 sm:p-9 shadow-[var(--shadow-modal)]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-[14px] bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] mx-auto mb-3.5">
              <Smartphone className="w-6 h-6" />
            </div>
            <h1 className="text-[22px] font-[800] text-[var(--ink)] tracking-tight mb-1.5">
              {t.verify_title}
            </h1>
            <p className="text-[13.5px] text-[var(--muted)]">
              {t.verify_subtitle}
            </p>
          </div>

          {/* Demo OTP Helper Box */}
          <div className="mb-6 p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] text-center">
            <span className="text-[12px] font-medium text-[var(--muted)] block mb-1">
              {lang === 'ru' ? 'Тестовый код подтверждения:' : 'Сыноо коду:'}
            </span>
            <div className="flex items-center justify-center gap-2">
              <code className="text-[18px] font-mono font-bold text-[var(--blue)] tracking-wider">
                {demoOtp}
              </code>
              <button
                type="button"
                onClick={() => setCode(demoOtp)}
                className="text-[12px] font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:underline cursor-pointer"
              >
                ({lang === 'ru' ? 'вставить' : 'коюу'})
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-4 rounded-[12px] bg-[var(--red-bg)] border border-[var(--red)]/20 text-[var(--red)] text-[13.5px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-[var(--ink)] mb-2 text-center">
                {t.code_label}
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                className="w-full h-[54px] bg-[var(--surface)] border border-[var(--field-line)] rounded-[12px] text-center text-2xl font-mono text-[var(--ink)] tracking-[0.4em] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all shadow-sm"
                required
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-[13px] text-[var(--muted)] pt-1">
              <span>{t.resend_code}</span>
              {timeLeft > 0 ? (
                <span className="font-mono font-bold text-[var(--ink)]">{timeLeft}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setTimeLeft(60)}
                  className="text-[var(--blue)] hover:underline font-bold cursor-pointer"
                >
                  Отправить повторно
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full justify-center mt-3 text-[15px]"
            >
              {isLoading ? t.verifying : t.verify_btn}
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

export default function StudentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="text-[14px] text-[var(--muted)]">Загрузка сессии...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
