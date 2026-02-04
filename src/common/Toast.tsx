import React from 'react';
import { useUI } from '../hooks/useUI';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Toast notification component
 * Displays temporary messages to the user
 */
export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useUI();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  const bgColors = {
    success: 'bg-white border-emerald-200',
    error: 'bg-white border-red-200',
    info: 'bg-white border-blue-200',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-full border shadow-lg ${bgColors[toastMessage.type]}`}
      >
        {icons[toastMessage.type]}
        <span className="text-[var(--ink)] text-sm">{toastMessage.message}</span>
        <button
          onClick={clearToast}
          className="ml-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
