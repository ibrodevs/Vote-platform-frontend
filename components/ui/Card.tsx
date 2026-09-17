import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive' | 'floating' | 'soot';
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] shadow-[var(--shadow-card)] rounded-[16px]",
    elevated: "bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] shadow-[var(--shadow-pop)] rounded-[16px]",
    interactive: "bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--blue)]/40 hover:shadow-[var(--shadow-pop)] transition-all duration-150 cursor-pointer text-[var(--ink)] rounded-[16px]",
    floating: "bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] shadow-[var(--shadow-pop)] rounded-[16px]",
    soot: "bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] rounded-[16px]"
  };

  return (
    <div
      className={`p-6 ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
