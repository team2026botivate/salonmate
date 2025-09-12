import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const NotificationSystem = ({ notifications, removeNotification }) => {
  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(
        () => {
          removeNotification(notification.id);
        },
        notification.type === 'error' ? 5000 : 3000
      );

      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  return (
    <div className="fixed z-50 space-y-2 top-4 right-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p
                  className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {notification.message}
                </p>
              </div>
              <div className="flex flex-shrink-0 ml-4">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className={`rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none ${
                    notification.type === 'success'
                      ? 'hover:text-green-500 focus:ring-green-500'
                      : 'hover:text-red-500 focus:ring-red-500'
                  }`}
                >
                  <span className="sr-only">Close</span>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
