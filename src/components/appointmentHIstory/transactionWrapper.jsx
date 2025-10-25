import React from 'react';
import TransactionFunctionality from './transactionFunctionnality';
// import { toast } from 'react-toastify'
import toast from 'react-hot-toast';
import { useCreateTransaction } from '../../hook/dbOperation';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '../inVoice/invoicePdf';
import supabase from '@/dataBase/connectdb';
import axios from 'axios';
// Demo wrapper component
const TransactionsPanel = ({ setIsEditModalOpen, transactionFromData }) => {
  const { createTransaction, loading, error } = useCreateTransaction();

  const mockBaseService = {
    name: transactionFromData?.service_name,
    price: transactionFromData?.service_price,
  };

  
  const handleSubmit = async (payload) => {
    const result = await createTransaction(payload);
    if (!error) {
      toast.success('Transaction created successfully');
      // Try sending invoice via WhatsApp for this appointment
      try {
        const appointmentId = payload?.appointmentId || transactionFromData?.id;
        if (!appointmentId) throw new Error('Missing appointmentId');

        // Fetch updated appointment row
        const { data: appointmentRows, error: apptErr } = await supabase
          .from('appointment')
          .select('*')
          .eq('id', appointmentId);
        if (apptErr) throw apptErr;
        const appt = Array.isArray(appointmentRows) ? appointmentRows[0] : appointmentRows;
        if (!appt) throw new Error('Appointment not found');

        // Fetch store info (name etc.)
        let storeName = '';
        if (appt?.store_id) {
          const { data: store, error: storeErr } = await supabase
            .from('stores')
            .select('name, shop_address, shop_number, gst_number')
            .eq('id', appt.store_id)
            .single();
          if (!storeErr && store) {
            storeName = store?.name || '';
          }
        }

        // Build invoice data (aligned with TodayTransaction.handleTransaction)
        const salonInfo = {
          name: storeName || appt?.store_name || '',
          address: appt?.shop_address || '',
          phone: appt?.shop_number || '',
          gst: appt?.gst_number || '',
        };

        const customerInfo = {
          name: appt?.['Customer Name'] || appt?.customer_name || 'Customer',
          phone: appt?.['Mobile Number'] || appt?.phone || appt?.['Phone'] || '',
          date: appt?.transactions_date || appt?.['Slot Date'] || new Date().toISOString(),
        };

        const baseServicePrice = Number(
          appt?.['Service Price'] ?? appt?.service_price ?? mockBaseService?.price ?? 0
        );
        const services = [
          {
            name: String(appt?.Services || mockBaseService?.name || 'Service'),
            qty: 1,
            price: isNaN(baseServicePrice) ? 0 : baseServicePrice,
          },
        ];

        const mappedExtras = Array.isArray(appt?.extra_Services)
          ? appt.extra_Services.map((s) => ({
              name: s?.service_name || s?.name || 'Extra Service',
              qty: 1,
              price: Number(s?.base_price ?? s?.price ?? 0) || 0,
            }))
          : [];

        const extrasSubtotal = mappedExtras.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
        const finalAmount = Number(appt?.transaction_final_amount);
        const discount = Number(appt?.transaction_discount ?? 0) || 0;
        const tax = Number(appt?.gst_amount ?? 0) || 0;

        const includeExtras = !(
          !isNaN(finalAmount) &&
          Math.abs(finalAmount - (services[0]?.price || 0)) < 0.01 &&
          discount === 0 &&
          tax === 0
        );

        const extraServices = mappedExtras;
        const subtotal = (services[0]?.price || 0) + (includeExtras ? extrasSubtotal : 0);
        const computedTotal = Math.max(0, subtotal - discount + tax);
        const total = Number(appt?.transaction_final_amount);
        const summary = {
          subtotal,
          discount,
          tax,
          total: isNaN(total) ? computedTotal : total,
        };

        const invoiceNumber = String(appt?.transaction_id || '').trim() || `INV-${Date.now()}`;

        const blob = await pdf(
          <InvoicePDF
            salonInfo={salonInfo}
            customerInfo={customerInfo}
            services={services}
            extraServices={extraServices}
            summary={summary}
            invoiceNumber={invoiceNumber}
          />
        ).toBlob();

        const safeName = (customerInfo.name || 'customer').replace(/[^a-z0-9\-_. ]/gi, '_');
        const fileName = `${invoiceNumber}-${safeName}.pdf`;
        const file = new File([blob], fileName, { type: 'application/pdf' });

        if (!import.meta.env.VITE_BACKEND_API) {
          toast.error('Backend API URL not configured');
        } else if (!customerInfo?.phone) {
          toast.error('Customer number not found, cannot send WhatsApp message');
        } else {
          const formData = new FormData();
          formData.append('clientName', customerInfo.name || 'Customer');
          formData.append('clientNumber', customerInfo.phone);
          formData.append('pdfFile', file);
          if (appt?.store_id) formData.append('storeId', String(appt.store_id));
          if (storeName) formData.append('storeName', storeName);

          try {
            const response = await axios.post(
              `${import.meta.env.VITE_BACKEND_API}/messages/whatsapp/transactionBill`,
              formData,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            if (response.status >= 200 && response.status < 300) {
              toast.success('Invoice sent via WhatsApp');
            } else {
              toast.error('Failed to send invoice via WhatsApp');
            }
          } catch (sendErr) {
            console.error('WhatsApp send error:', sendErr);
            const errorMsg = sendErr?.response?.data?.message || 'Network error while sending WhatsApp message';
            const quota = sendErr?.response?.data?.quota;
            
            if (quota) {
              toast.error(`${errorMsg} (${quota.remaining}/${quota.monthly_quota} messages remaining)`);
            } else {
              toast.error(errorMsg);
            }
          }
        }
      } catch (werr) {
        console.error('WhatsApp send failed:', werr);
      } finally {
        setIsEditModalOpen(false);
      }
    } else {
      toast.error('Transaction failed');
    }
  };



  return (
    <TransactionFunctionality
      loadingForSubmit={loading}
      appointmentId={transactionFromData?.id}
      baseService={mockBaseService}
      onSubmit={handleSubmit}
      extraServices={transactionFromData?.extra_services}
      setIsEditModalOpen={setIsEditModalOpen}
    />
  );
};

export default TransactionsPanel;
