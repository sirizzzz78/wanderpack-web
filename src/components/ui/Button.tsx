import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', disabled, ...props }: ButtonProps) {
  const base = 'w-full py-4 rounded-[20px] font-semibold text-[16px] transition-all duration-150 active:scale-[0.98]';

  const variants = {
    primary: `${base} text-white ${disabled ? 'bg-[var(--button-disabled)] cursor-not-allowed' : 'bg-[var(--lavender)] hover:opacity-90'}`,
    ghost: `${base} text-[var(--text-primary)] font-medium bg-transparent border border-[var(--border)] hover:bg-[var(--surface)]`,
  };

  return (
    <button className={`${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
