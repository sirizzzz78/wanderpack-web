import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function Stepper({ value, onChange, min = 1, max = 99 }: StepperProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 transition-colors"
      >
        <Minus size={14} />
      </button>
      <span className="text-[16px] font-semibold text-[var(--lavender)] min-w-[20px] text-center">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
