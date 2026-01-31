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
    success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-emerald-900/90 border-emerald-700',
    error: 'bg-red-900/90 border-red-700',
    info: 'bg-blue-900/90 border-blue-700',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[toastMessage.type]}`}
      >
        {icons[toastMessage.type]}
        <span className="text-white text-sm">{toastMessage.message}</span>
        <button
          onClick={clearToast}
          className="ml-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
