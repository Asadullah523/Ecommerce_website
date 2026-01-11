import React, { useEffect } from 'react';
import { Check, X, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle
};

const styles = {
  success: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]',
  error: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
  info: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
};

export function Toast({ id, message, type = 'info', onClose }) {
  const Icon = icons[type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={`flex items-center gap-3 px-4 py-4 rounded-xl border backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 mb-3 min-w-[300px] ${styles[type]}`}>
      <div className={`p-1.5 rounded-full ${type === 'success' ? 'bg-green-500/20' : type === 'error' ? 'bg-red-500/20' : 'bg-white/10'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-bold tracking-wide">{message}</p>
      <button 
        onClick={() => onClose(id)}
        className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="h-4 w-4 opacity-50" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
}
