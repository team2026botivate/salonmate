import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function NotificationAlert({ type, title, message, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  const getAlertStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'success':
        return 'text-green-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${getAlertStyles()} animate-slide-down mb-4 rounded-xl border-l-4 p-4 shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="ml-3 flex-1">
          <h3 className="mb-1 text-sm font-bold">{title}</h3>
          <p className="text-sm opacity-90">{message}</p>
        </div>

        <button
          onClick={handleClose}
          className="ml-4 inline-flex flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
