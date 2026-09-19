import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
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
      className={cn(variantStyles[variant] || variantStyles.default, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-header'
      className={cn(
        'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pb-4',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-title'
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-description'
      className={cn('text-[var(--muted)] text-sm', className)}
      {...props}
    />
  );
}

export function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-action'
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-content'
      className={cn('px-6', className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-footer'
      className={cn('flex items-center px-6 pt-4 border-t border-[var(--line)]', className)}
      {...props}
    />
  );
}

