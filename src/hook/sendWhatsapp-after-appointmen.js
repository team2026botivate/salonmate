import axios from 'axios';

export function useSendWhatsappAfterAppointment() {
  const sendWhatsappAfterAppointment = async (storeId, storeName, customerNumber, customerName) => {
    if (!storeId || !customerNumber || !customerName || !storeName) {
      console.log('Missing required parameters');
      return;
    }

    console.log(storeId, storeName, customerNumber, customerName);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/messages/whatsapp/appointment`,
        {
          storeId,
          storeName,
          customerNumber,
          customerName,
        }
      );

      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  return { sendWhatsappAfterAppointment };
}
