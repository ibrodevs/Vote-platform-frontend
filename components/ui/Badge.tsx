import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'red' | 'amber' | 'teal' | 'gray' | 'cyan' | 'active' | 'neutral' | 'outline' | 'soot' | 'warning';
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'gray',
  dot = false,
  className = ''
}: BadgeProps) {
  // Map all legacy variants to CRM Admin pill semantic classes
  let pillClass = "pill-gray";
  let dotColor = "bg-[var(--muted)]";

  if (variant === 'green' || variant === 'active') {
    pillClass = "pill-green";
    dotColor = "bg-[var(--green)]";
  } else if (variant === 'blue' || variant === 'cyan') {
    pillClass = "pill-blue";
    dotColor = "bg-[var(--blue)]";
  } else if (variant === 'red') {
    pillClass = "pill-red";
    dotColor = "bg-[var(--red)]";
  } else if (variant === 'amber' || variant === 'warning') {
    pillClass = "pill-amber";
    dotColor = "bg-[var(--amber)]";
  } else if (variant === 'teal') {
    pillClass = "pill-teal";
    dotColor = "bg-[var(--teal)]";
  } else if (variant === 'soot') {
    pillClass = "bg-[var(--ink)] text-[var(--surface)]";
    dotColor = "bg-[var(--surface)]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-[30px] px-3.5 rounded-full text-[13px] font-semibold tracking-normal select-none ${pillClass} ${className}`}
    >
      {dot && (
        <span
          className={`h-2 w-2 rounded-full ${dotColor} ${
            variant === 'green' || variant === 'active' || variant === 'blue' || variant === 'cyan' ? 'animate-pulse' : ''
          }`}
        />
      )}
      {children}
    </span>
  );
}
