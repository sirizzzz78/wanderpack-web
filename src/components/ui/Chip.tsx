import { type ReactNode } from 'react';
import { LucideIcon } from './LucideIcon';

interface ChipProps {
  icon?: string;
  label: string;
  color?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Chip({ icon, label, color = 'var(--lavender)', selected, onClick }: ChipProps) {
  const bg = selected ? color : `color-mix(in srgb, ${color} 12%, transparent)`;
  const fg = selected ? 'white' : color;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] text-[11px] font-medium transition-colors duration-150"
      style={{ backgroundColor: bg, color: fg }}
    >
      {icon && <LucideIcon name={icon} size={12} />}
      {label}
    </button>
  );
}
