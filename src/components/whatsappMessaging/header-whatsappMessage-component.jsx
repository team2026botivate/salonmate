import { Bell, User, MessageCircle } from 'lucide-react';

export default function Header({ userName = 'User', notifications = 2 }) {
  return (
    <header className="sticky top-0 z-50 text-white bg-blue-500 shadow-lg">
      <div className="container px-4 py-4 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-full">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">WhatsApp Quota Manager</h1>
              <p className="text-xs text-green-100">Messaging Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="relative p-2 transition-all duration-200 transform rounded-full hover:scale-110 hover:bg-green-700"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1 animate-pulse">
                  {notifications}
                </span>
              )}
            </button>

            <div className="flex items-center px-3 py-2 space-x-2 transition-colors bg-green-700 rounded-full cursor-pointer hover:bg-green-800">
              <div className="p-1 bg-white rounded-full">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <span className="hidden text-sm font-medium sm:block">{userName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
