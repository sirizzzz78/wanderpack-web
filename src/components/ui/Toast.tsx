import { useEffect, useState, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed left-4 right-4 z-[100] flex flex-col items-center gap-2 pointer-events-none" style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const fadeRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    timerRef.current = setTimeout(() => {
      setVisible(false);
      fadeRef.current = setTimeout(onDismiss, 300);
    }, 3000);
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(fadeRef.current);
    };
  }, [onDismiss]);

  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
  const iconColor = toast.type === 'success' ? 'text-[var(--salmon)]' : toast.type === 'error' ? 'text-[var(--destructive)]' : 'text-[var(--lavender)]';

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] shadow-lg max-w-sm w-full transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <Icon size={18} className={`${iconColor} shrink-0`} />
      <span className="flex-1 text-[14px] font-medium text-[var(--text-primary)]">{toast.message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="p-1 shrink-0">
        <X size={14} className="text-[var(--text-secondary)]" />
      </button>
    </div>
  );
}
