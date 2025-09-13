import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationSystem = ({ notifications, removeNotification }) => {
  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(
        () => {
          removeNotification(notification.id);
        },
        notification.type === 'error' ? 6000 : notification.type === 'warning' ? 5000 : 4000
      );

      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-white border-l-4 border-green-500 shadow-lg',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          title: 'text-green-800',
          message: 'text-green-700',
          closeButton: 'text-green-400 hover:text-green-600 focus:ring-green-500'
        };
      case 'error':
        return {
          container: 'bg-white border-l-4 border-red-500 shadow-lg',
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          title: 'text-red-800',
          message: 'text-red-700',
          closeButton: 'text-red-400 hover:text-red-600 focus:ring-red-500'
        };
      case 'warning':
        return {
          container: 'bg-white border-l-4 border-yellow-500 shadow-lg',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          closeButton: 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500'
        };
      case 'info':
        return {
          container: 'bg-white border-l-4 border-blue-500 shadow-lg',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          title: 'text-blue-800',
          message: 'text-blue-700',
          closeButton: 'text-blue-400 hover:text-blue-600 focus:ring-blue-500'
        };
      default:
        return {
          container: 'bg-white border-l-4 border-gray-500 shadow-lg',
          icon: <Info className="w-5 h-5 text-gray-500" />,
          title: 'text-gray-800',
          message: 'text-gray-700',
          closeButton: 'text-gray-400 hover:text-gray-600 focus:ring-gray-500'
        };
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Notification';
    }
  };

  return (
    <div className="fixed z-50 w-full max-w-sm space-y-3 top-4 right-4">
      {notifications.map((notification) => {
        const styles = getNotificationStyles(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`${styles.container} rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out animate-in slide-in-from-right-full`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {styles.icon}
                </div>
                <div className="flex-1 min-w-0 ml-3">
                  <p className={`text-sm font-semibold ${styles.title} mb-1`}>
                    {notification.title || getNotificationTitle(notification.type)}
                  </p>
                  <p className={`text-sm ${styles.message} leading-relaxed`}>
                    {notification.message}
                  </p>
                  {notification.description && (
                    <p className={`text-xs ${styles.message} mt-1 opacity-80`}>
                      {notification.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-4">
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className={`rounded-md inline-flex p-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.closeButton}`}
                    aria-label="Close notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            <div className="h-1 bg-gray-100">
              <div 
                className={`h-full transition-all duration-300 ease-linear ${
                  notification.type === 'success' ? 'bg-green-500' :
                  notification.type === 'error' ? 'bg-red-500' :
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{
                  animation: `shrink ${notification.type === 'error' ? '6000ms' : notification.type === 'warning' ? '5000ms' : '4000ms'} linear forwards`
                }}
              />
            </div>
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-right-full {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-duration: 300ms;
          animation-fill-mode: both;
        }
        
        .slide-in-from-right-full {
          animation-name: slide-in-from-right-full;
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;