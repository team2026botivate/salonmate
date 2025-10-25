import { useEffect, useState } from 'react';
import { axiosInstance } from '../utils/axios';
import { useAppData } from '../zustand/appData';
import NotificationAlert from './whatsappMessaging/notification-whatsappMessaging-component';
import QuotaCard from './whatsappMessaging/quotaCard-whatsappMessaging-component';
import axios from 'axios';

function App() {
  const [showLowQuotaAlert, setShowLowQuotaAlert] = useState(false);
  const { store_id } = useAppData();

  
  const [loading, setLoading] = useState(false);
  const [quotaData, setQuotaData] = useState({
    totalAmount: 0,
    totalMessages: 0,
    messagesSent: 0,
    messagesRemaining: 0,
    lastRechargeDate: null,
  });
  const [storeInfo, setStoreInfo] = useState(null);

  const demoMessageUsage = [];

  const getLast7DaysData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dailyMessages = demoMessageUsage
        .filter((msg) => {
          const msgDate = new Date(msg.sent_at).toISOString().split('T')[0];
          return msgDate === dateStr;
        })
        .reduce((sum, msg) => sum + msg.messages_count, 0);

      const randomMessages = Math.floor(Math.random() * 800) + 600;

      last7Days.push({
        date: date.toISOString(),
        messages: dailyMessages || randomMessages,
      });
    }
    return last7Days;
  };

  const chartData = getLast7DaysData();

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!store_id) return;
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/messages/whatsapp/dashboard`,
          {
            params: { storeId: store_id },
          }
        );

        console.log(data,"data form the dashboard");
        const d = data?.data || {};
        setQuotaData({
          totalAmount: Number(d?.total_recharge || 0),
          totalMessages: Number(d?.total_messages || 0),
          messagesSent: Number(d?.sent_messages || 0),
          messagesRemaining: Number(d?.messages_remaining || 0),
          lastRechargeDate: d?.last_recharge_date || null,
        });
        setShowLowQuotaAlert(Boolean(d?.low_quota));

        const storeRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/messages/whatsapp/store`,
          {
            params: { storeId: store_id },
          }
        );

        console.log(storeRes,"storeRes");
        setStoreInfo(storeRes?.data?.data || null);
      } catch (e) {
        console.error('Failed to load WhatsApp dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [store_id]);

  useEffect(() => {
    const usagePercentage =
      quotaData.totalMessages > 0 ? (quotaData.messagesSent / quotaData.totalMessages) * 100 : 0;
    if (usagePercentage > 80) setShowLowQuotaAlert(true);
  }, [quotaData.messagesSent, quotaData.totalMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-green-500 rounded-full animate-spin border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* <Header userName="Demo User" notifications={2} /> */}

      <main className="container px-4 py-6 mx-auto space-y-6 md:py-8">
        {showLowQuotaAlert && (
          <NotificationAlert
            type="error"
            title="Low Quota Alert"
            message="Your message quota is running low. Consider recharging to continue sending messages without interruption."
            onClose={() => setShowLowQuotaAlert(false)}
          />
        )}

        <QuotaCard
          totalAmount={quotaData.totalAmount}
          totalMessages={quotaData.totalMessages}
          messagesSent={quotaData.messagesSent}
          messagesRemaining={quotaData.messagesRemaining}
          lastRechargeDate={quotaData.lastRechargeDate}
        />

        {storeInfo && (
          <div className="p-6 bg-white border border-gray-100 shadow-xl rounded-2xl md:p-8">
            <h3 className="mb-4 text-xl font-bold text-gray-800">Store Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Store ID</p>
                <p className="font-semibold text-gray-800 break-all">{storeInfo.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-semibold text-gray-800">
                  {storeInfo.created_at ? new Date(storeInfo.created_at).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Quota</p>
                <p className="font-semibold text-gray-800">{storeInfo.monthly_quota ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Used Messages</p>
                <p className="font-semibold text-gray-800">{storeInfo.used_messages ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reset Date</p>
                <p className="font-semibold text-gray-800">
                  {storeInfo.reset_date ? new Date(storeInfo.reset_date).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recharge Price</p>
                <p className="font-semibold text-gray-800">{storeInfo.recharge_price ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Shop Number</p>
                <p className="font-semibold text-gray-800">{storeInfo.shop_number ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Shop Address</p>
                <p className="font-semibold text-gray-800">{storeInfo.shop_address ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">GST Number</p>
                <p className="font-semibold text-gray-800">{storeInfo.gst_number ?? '-'}</p>
              </div>
            </div>
          </div>
        )}
        {/* 
        <ActionButtons
          onRecharge={handleRecharge}
          onSendMessage={handleSendMessage}
          onViewTemplates={handleViewTemplates}
        /> */}

        {/* <div className="grid gap-6 bg-red-500 lg:grid-cols-2">
          <UsageChart data={chartData} />
          <TransactionHistory transactions={demoTransactions} />
        </div> */}
      </main>

      <footer className="py-6 mt-12 bg-white border-t border-gray-200">
        <div className="container px-4 mx-auto text-sm text-center text-gray-600">
          <p>WhatsApp Quota Manager &copy; 2025. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
