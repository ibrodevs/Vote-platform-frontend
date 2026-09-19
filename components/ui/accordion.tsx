'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextType {
  value?: string | string[];
  onValueChange: (val: string) => void;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (val: string | string[]) => void;
}

export function Accordion({
  type = 'single',
  collapsible = true,
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  className,
  children,
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    defaultValue || (type === 'multiple' ? [] : '')
  );

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = React.useCallback(
    (itemValue: string) => {
      if (type === 'single') {
        const nextValue = currentValue === itemValue && collapsible ? '' : itemValue;
        if (controlledOnValueChange) {
          controlledOnValueChange(nextValue);
        } else {
          setInternalValue(nextValue);
        }
      } else {
        const currentArr = Array.isArray(currentValue) ? currentValue : [];
        const nextArr = currentArr.includes(itemValue)
          ? currentArr.filter((v) => v !== itemValue)
          : [...currentArr, itemValue];
        if (controlledOnValueChange) {
          controlledOnValueChange(nextArr);
        } else {
          setInternalValue(nextArr);
        }
      }
    },
    [type, collapsible, currentValue, controlledOnValueChange]
  );

  return (
    <AccordionContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        type,
        collapsible,
      }}
    >
      <div className={cn('divide-y divide-[var(--line)]', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItemContext = React.createContext<{ value: string; isOpen: boolean }>({
  value: '',
  isOpen: false,
});

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  const context = React.useContext(AccordionContext);
  const isOpen = Array.isArray(context?.value)
    ? context?.value.includes(value)
    : context?.value === value;

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        data-state={isOpen ? 'open' : 'closed'}
        className={cn('border-b border-[var(--line)] transition-colors', className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  const isOpen = itemContext.isOpen;

  return (
    <div className="flex">
      <button
        type="button"
        aria-expanded={isOpen}
        data-state={isOpen ? 'open' : 'closed'}
        onClick={() => context?.onValueChange(itemContext.value)}
        className={cn(
          'flex flex-1 items-center justify-between py-3.5 sm:py-5 text-left text-[14.5px] sm:text-[16px] md:text-[17px] font-semibold text-[var(--ink)] transition-all hover:text-[var(--blue)] cursor-pointer gap-3',
          className
        )}
        {...props}
      >
        <span className="leading-snug">{children}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-300',
            isOpen && 'rotate-180 text-[var(--blue)]'
          )}
        />
      </button>
    </div>
  );
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const itemContext = React.useContext(AccordionItemContext);
  const isOpen = itemContext.isOpen;

  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      className={cn(
        'grid transition-all duration-300 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100 pb-4 sm:pb-5' : 'grid-rows-[0fr] opacity-0 pb-0',
        className
      )}
      {...props}
    >
      <div className="overflow-hidden text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed text-[var(--muted)]">
        {children}
      </div>
    </div>
  );
}
