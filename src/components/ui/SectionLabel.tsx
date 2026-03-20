import { type ReactNode } from 'react';

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--blue-faint)]">
      {children}
    </span>
  );
}
