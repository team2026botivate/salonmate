import { IndianRupee, MessageSquare, Send, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function QuotaCard({
  totalAmount,
  totalMessages,
  messagesSent,
  messagesRemaining,
  lastRechargeDate
}) {
  const usagePercentage = totalMessages > 0 ? (messagesSent / totalMessages) * 100 : 0;
  const isLowQuota = usagePercentage > 80;
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(usagePercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [usagePercentage]);

  return (
    <div className="p-6 transition-shadow duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl md:p-8 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quota Overview</h2>
        {isLowQuota && (
          <span className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full animate-pulse">
            Low Quota
          </span>
        )}
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="p-5 transition-transform duration-200 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Total Recharged</p>
              <div className="flex items-center">
                <IndianRupee className="w-6 h-6 mr-1 text-green-600" />
                <span className="text-3xl font-bold text-gray-800">{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-3 bg-green-600 rounded-full">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-5 transition-transform duration-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Total Messages</p>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-800">{totalMessages.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-blue-600 rounded-full">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Messages Sent</span>
            </div>
            <span className="text-lg font-bold text-gray-800">{messagesSent.toLocaleString()}</span>
          </div>

          <div className="w-full h-4 overflow-hidden bg-gray-200 rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isLowQuota ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}
              style={{ width: `${animatedPercentage}%` }}
            >
              <div className="w-full h-full bg-white/30 animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {usagePercentage.toFixed(1)}% used
            </span>
            <span className="text-xs text-gray-500">
              {totalMessages.toLocaleString()} total
            </span>
          </div>
        </div>

        <div className="p-5 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center mb-1 text-sm text-gray-600">
                <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                Messages Remaining
              </p>
              <span className="text-3xl font-bold text-green-600">{messagesRemaining.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {lastRechargeDate && (
          <div className="flex items-center pt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>Last recharged: {new Date(lastRechargeDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
