import React from 'react';

export function AuroraRibbon({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute right-0 top-0 overflow-hidden opacity-65 ${className}`}>
      <svg
        width="680"
        height="520"
        viewBox="0 0 680 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform translate-x-20 -translate-y-12"
      >
        <defs>
          <linearGradient id="aurora-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#006aff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a95af8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fb9ce5" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="aurora-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34e8bb" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#a95af8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#006aff" stopOpacity="0.2" />
          </linearGradient>
          <filter id="aurora-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        {/* Ambient glow */}
        <path
          d="M200,100 Q400,250 600,80 T680,400 Q450,550 220,380 Z"
          fill="url(#aurora-gradient-1)"
          filter="url(#aurora-blur)"
          opacity="0.5"
        />

        {/* Crisp Ribbon Wave 1 */}
        <path
          d="M120,40 Q280,180 480,110 T680,260"
          stroke="url(#aurora-gradient-1)"
          strokeWidth="48"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        {/* Ribbon Wave 2 */}
        <path
          d="M80,160 Q240,290 520,210 T720,380"
          stroke="url(#aurora-gradient-2)"
          strokeWidth="32"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />

        {/* Ribbon Wave 3 (Accent line) */}
        <path
          d="M160,110 Q320,240 560,160 T760,320"
          stroke="#fb9ce5"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
