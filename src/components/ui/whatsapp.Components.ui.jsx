import { useState } from 'react';
import { Send, Loader2, User, Phone, FileText, Upload } from 'lucide-react';
import Toast from './tost.Components.ui';

export default function WhatsAppButton({ onClick, loading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex w-full transform items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#20BA5A] hover:shadow-xl active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Sending...</span>
        </>
      ) : (
        <>
          <Send className="h-5 w-5" />
          <span>Send via WhatsApp</span>
        </>
      )}
    </button>
  );
}

// Named export: BillingDashboard - adapted from provided TypeScript to JavaScript
export function BillingDashboard() {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const clientName = 'Priya Sharma';
  const clientNumber = '917898802586';

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
      const formData = new FormData();
      formData.append('clientName', clientName);
      formData.append('clientNumber', clientNumber);
      formData.append('pdfFile', pdfFile);

      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ show: true, message: 'Bill sent successfully via WhatsApp!', type: 'success' });
        setPdfFile(null);
      } else {
        setToast({ show: true, message: data.message || 'Failed to send bill. Please try again.', type: 'error' });
      }
    } catch (error) {
      setToast({ show: true, message: 'Network error. Please check your connection.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Send PDF to Client</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-teal-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Customer Name</p>
                <p className="text-sm font-medium text-gray-900">{clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-teal-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Mobile Number</p>
                <p className="text-sm font-medium text-gray-900">{clientNumber}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">PDF File</p>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="bg-teal-100 p-2 rounded-lg">
                  {pdfFile ? (
                    <FileText className="w-5 h-5 text-teal-600" />
                  ) : (
                    <Upload className="w-5 h-5 text-teal-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{pdfFile ? pdfFile.name : 'Choose PDF file'}</p>
                  {pdfFile && (
                    <p className="text-xs text-gray-500">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                  )}
                </div>
                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            <div className="pt-2">
              <WhatsAppButton onClick={handleSendWhatsApp} loading={loading} disabled={loading} />
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
      )}
    </div>
  );
}
