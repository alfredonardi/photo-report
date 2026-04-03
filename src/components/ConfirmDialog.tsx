import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onClose,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const focusTimer = window.setTimeout(() => {
      cancelButtonRef.current?.focus({ preventScroll: true });
    }, 40);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const confirmToneClass = tone === 'danger'
    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800';

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-6 sm:items-center sm:px-4 sm:py-6">
      <button
        type="button"
        aria-label="Fechar diálogo"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative z-10 w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:max-h-[calc(100dvh-3rem)] sm:p-6"
      >
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900">{title}</h2>
            <p id="confirm-dialog-description" className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${confirmToneClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
