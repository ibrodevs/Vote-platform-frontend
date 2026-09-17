import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none select-none";

  const sizeClasses = {
    sm: "h-[38px] px-3.5 text-[13px] rounded-[10px]",
    md: "h-[46px] px-5 text-[14.5px] rounded-[12px]",
    lg: "h-[50px] px-6 text-[15.5px] rounded-[12px]"
  };

  const variantClasses = {
    primary: "bg-[var(--blue)] text-white hover:bg-[var(--blue-hover)] active:bg-[var(--blue-press)] shadow-[var(--shadow-blue-btn)] active:scale-[0.99]",
    secondary: "bg-[var(--surface)] text-[var(--ink)] border border-[var(--field-line)] hover:bg-[var(--hover)] hover:border-[var(--line-strong)] active:scale-[0.99]",
    ghost: "bg-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)]",
    danger: "bg-[var(--red-bg)] text-[var(--red)] border border-[var(--red)]/20 hover:bg-[var(--red)] hover:text-white active:scale-[0.99]",
    link: "p-0 text-[var(--muted)] hover:text-[var(--blue)] bg-transparent font-normal text-[13.5px]"
  };

  if (variant === 'link') {
    return (
      <button
        disabled={disabled || isLoading}
        className={`${variantClasses.link} ${className} inline-flex items-center gap-1.5 cursor-pointer`}
        {...props}
      >
        {children}
        <span className="transition-transform group-hover:translate-x-1 text-[var(--blue)]">→</span>
      </button>
    );
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs">Загрузка...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
