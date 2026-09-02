import React from 'react';
import { useMine } from '../../context/MineContext';
import { AlertTriangle, Flame, CheckCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts = [], removeToast } = useMine();

  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'critical':
        return <Flame className="h-4 w-4 text-status-critical flex-shrink-0 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-status-warning flex-shrink-0" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-status-safe flex-shrink-0" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-mine-text-secondary flex-shrink-0" />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'critical':
        return 'border-status-critical/40 bg-status-critical-bg/95 shadow-red-500/10';
      case 'warning':
        return 'border-status-warning/40 bg-status-warning-bg/95 shadow-amber-500/10';
      case 'success':
        return 'border-status-safe/40 bg-status-safe-bg/95 shadow-emerald-500/10';
      case 'info':
      default:
        return 'border-mine-border bg-mine-surface/95 shadow-black/10';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto border rounded-lg p-3.5 shadow-dropdown backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 flex items-start gap-3 text-mine-text-primary ${getToastStyles(
            toast.type
          )}`}
        >
          <div className="pt-0.5">{getToastIcon(toast.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold tracking-tight text-mine-text-primary truncate">
                {toast.title}
              </h4>
              <span className="text-[10px] text-mine-text-secondary font-mono flex-shrink-0">
                {toast.time || 'now'}
              </span>
            </div>
            <p className="text-xs text-mine-text-secondary mt-0.5 leading-relaxed break-words">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded text-mine-text-secondary hover:text-mine-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition flex-shrink-0"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
