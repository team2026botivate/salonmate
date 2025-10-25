import { useState } from 'react';
import { User, Phone, FileText, X, Upload } from 'lucide-react';
import supabase from '@/dataBase/connectdb';

import WhatsAppButton from '../ui/whatsapp.Components.ui';
import Toast from '../ui/tost.Components.ui';
import axios from 'axios';

export default function BillingDashboard({ setIsWhatsappModelOpen, transactionFromData }) {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const clientName = transactionFromData?.customer_name || transactionFromData?.['Customer Name'];
  const clientNumber =
    transactionFromData?.customer_number || transactionFromData?.['Mobile Number'];
  const storeId =
    transactionFromData?.store_id || transactionFromData?.storeId || transactionFromData?.storeID;
  const pdfName = 'Invoice_2024_001.pdf';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else if (file) {
      setToast({ show: true, message: 'Please select a valid PDF file.', type: 'error' });
    }
  };

  const handleSendWhatsApp = async () => {
    if (!pdfFile) {
      setToast({ show: true, message: 'Please select a PDF file to send.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // fetch store name from DB
      let storeName = '';

      if (storeId) {
        const { data: store, error } = await supabase
          .from('stores')
          .select('name')
          .eq('id', storeId)
          .single();
        if (!error && store) {
          storeName = store.name || '';
        }
      }

      const formData = new FormData();
      formData.append('clientName', clientName || '');
      formData.append('clientNumber', clientNumber || '');
      formData.append('pdfFile', pdfFile);
      if (storeId) formData.append('storeId', String(storeId));
      if (storeName) formData.append('storeName', storeName);


  
      if (!import.meta.env.VITE_BACKEND_API) {
        setToast({ show: true, message: 'Backend API URL not found.', type: 'error' });
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/messages/whatsapp/transactionBill`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const data = response?.data;

      if (response.status >= 200 && response.status < 300) {
        setToast({ show: true, message: 'Bill sent successfully via WhatsApp!', type: 'success' });
        setPdfFile(null);
        setTimeout(() => {
          setIsWhatsappModelOpen(false);
        }, 1000);
      } else {
        setToast({
          show: true,
          message: data.message || 'Failed to send bill. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('WhatsApp send error:', error);
      const errorMsg =
        error?.response?.data?.message || 'Network error. Please check your connection.';
      const quota = error?.response?.data?.quota;

      let displayMsg = errorMsg;
      if (quota) {
        displayMsg = `${errorMsg} (${quota.remaining}/${quota.monthly_quota} messages remaining)`;
      }

      setToast({
        show: true,
        message: displayMsg,
        type: 'error',
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setIsWhatsappModelOpen(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-[rgba(2)] p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm">
        <X
          onClick={() => setIsWhatsappModelOpen(false)}
          className="absolute text-red-500 top-5 right-5 hover:cursor-pointer hover:text-red-700"
        />
        <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
          <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600">
            <h2 className="text-lg font-semibold text-white">Send PDF to Client</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="p-2 bg-teal-100 rounded-lg">
                <User className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Customer Name</p>
                <p className="text-sm font-medium text-gray-900">{clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Phone className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Mobile Number</p>
                <p className="text-sm font-medium text-gray-900">{clientNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">PDF File</p>
                <label className="flex items-center gap-3 p-3 transition-colors border border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    {pdfFile ? (
                      <FileText className="w-5 h-5 text-teal-600" />
                    ) : (
                      <Upload className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {pdfFile ? pdfFile.name : 'Choose PDF file'}
                    </p>
                    {pdfFile && (
                      <p className="text-xs text-gray-500">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                    )}
                  </div>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="pt-2">
              <WhatsAppButton onClick={handleSendWhatsApp} loading={loading} disabled={loading} />
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}
