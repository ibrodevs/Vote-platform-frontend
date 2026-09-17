'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VoteIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('student_token') : null;
    if (token) {
      router.replace('/vote/cabinet');
    } else {
      router.replace('/vote/auth');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] text-[14px]">
      Перенаправление в систему голосования...
    </div>
  );
}
