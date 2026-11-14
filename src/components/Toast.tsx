import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  tone?: 'success' | 'info' | 'error';
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastStack: React.FC<ToastStackProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const tone = toast.tone || 'info';
        const Icon =
          tone === 'success'
            ? CheckCircle2
            : tone === 'error'
              ? AlertCircle
              : Info;
        const iconColor =
          tone === 'success'
            ? 'text-emerald-600'
            : tone === 'error'
              ? 'text-rose-600'
              : 'text-[#634EE3]';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[#E4E0F3] bg-white px-4 py-3 text-sm font-medium text-[#1E1B2E] shadow-lg shadow-[#1E1B2E]/10"
          >
            <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-[#78748D] hover:bg-[#F3F1FA] hover:text-[#1E1B2E]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
