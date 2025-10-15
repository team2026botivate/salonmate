import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="animate-slide-in fixed top-4 right-4 z-50">
      <div
        className={`flex items-center gap-3 rounded-xl px-6 py-4 shadow-lg backdrop-blur-sm ${
          type === 'success'
            ? 'border border-emerald-200 bg-emerald-50'
            : 'border border-rose-200 bg-rose-50'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 text-rose-600" />
        )}
        <p
          className={`text-sm font-medium ${
            type === 'success' ? 'text-emerald-900' : 'text-rose-900'
          }`}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
