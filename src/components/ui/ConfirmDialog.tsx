interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel',
  destructive = true, onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onCancel}>
      <div
        className="bg-[var(--surface)] rounded-[14px] mx-6 max-w-sm w-full shadow-xl"
        style={{ padding: 'var(--card-px)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
        <p className="text-[14px] text-[var(--text-secondary)] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-[20px] font-semibold text-[15px] text-[var(--text-primary)] border border-[var(--border)] transition-all active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 rounded-[20px] font-semibold text-[15px] text-white transition-all active:scale-[0.98] ${
              destructive ? 'bg-[var(--destructive)]' : 'bg-[var(--lavender)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
