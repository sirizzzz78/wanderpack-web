import { Search, XCircle } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search items...' }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-[var(--surface)] rounded-[14px] border border-[var(--border)]">
      <Search size={16} className="text-[var(--text-secondary)] shrink-0" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[16px] text-[var(--text-primary)] outline-none"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Clear search" className="shrink-0 p-2 -m-1 rounded-full">
          <XCircle size={18} className="text-[var(--text-secondary)]" />
        </button>
      )}
    </div>
  );
}
