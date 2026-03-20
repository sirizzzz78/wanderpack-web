import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  bg?: string;
  children: ReactNode;
}

export function Card({ bg, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-[14px] border border-[var(--border)] ${className}`}
      style={{ backgroundColor: bg || 'var(--surface)' }}
      {...props}
    >
      {children}
    </div>
  );
}
