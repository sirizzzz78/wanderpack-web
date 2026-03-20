import { type ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showHandle?: boolean;
}

export function Modal({ open, onClose, children, title, showHandle = true }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop" onClick={onClose}>
      <div
        ref={ref}
        className="w-full max-w-lg bg-[var(--background)] rounded-t-[20px] max-h-[90dvh] overflow-y-auto transition-slide-up animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
          </div>
        )}
        {title && (
          <div className="flex items-center justify-between px-5 pt-2 pb-4">
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)]">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--surface)]">
              <X size={18} className="text-[var(--text-secondary)]" />
            </button>
          </div>
        )}
        {children}
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </div>
  );
}
