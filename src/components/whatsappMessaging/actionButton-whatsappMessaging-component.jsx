import { CreditCard, Send, FileText, Zap } from 'lucide-react';

export default function ActionButtons({ onRecharge, onSendMessage, onViewTemplates }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <button
        onClick={onRecharge}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="text-left">
            <div className="mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 animate-pulse" />
              <h3 className="text-lg font-bold">Recharge Now</h3>
            </div>
            <p className="text-sm text-green-100">Add more messages to your quota</p>
          </div>

          <div className="rounded-full bg-white/20 p-3 transition-colors group-hover:bg-white/30">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-white/30">
          <div className="h-full w-0 bg-white/50 transition-all duration-700 group-hover:w-full"></div>
        </div>
      </button>

      <button
        onClick={onSendMessage}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="text-left">
            <div className="mb-2 flex items-center">
              <h3 className="text-lg font-bold">Send Messages</h3>
            </div>
            <p className="text-sm text-blue-100">Compose and send WhatsApp messages</p>
          </div>

          <div className="rounded-full bg-white/20 p-3 transition-all group-hover:rotate-12 group-hover:bg-white/30">
            <Send className="h-6 w-6" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-white/30">
          <div className="h-full w-0 bg-white/50 transition-all duration-700 group-hover:w-full"></div>
        </div>
      </button>

      <button
        onClick={onViewTemplates}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="text-left">
            <div className="mb-2 flex items-center">
              <h3 className="text-lg font-bold">View Templates</h3>
            </div>
            <p className="text-sm text-purple-100">Browse message templates</p>
          </div>

          <div className="rounded-full bg-white/20 p-3 transition-colors group-hover:bg-white/30">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-white/30">
          <div className="h-full w-0 bg-white/50 transition-all duration-700 group-hover:w-full"></div>
        </div>
      </button>
    </div>
  );
}
