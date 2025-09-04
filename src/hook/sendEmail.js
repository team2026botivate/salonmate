import { axiosInstance } from '@/utils/axios'
import toast from 'react-hot-toast'



export const useSendEmail = () => {
  const sendEmail = async (message, emailAddress) => {
    const payload = {
      email: emailAddress,
      subject: 'SalonMate Notification',
      html: `<p>${String(message || '').replace(/\n/g, '<br/>')}</p>`,
    }
    try {
      const { data } = await axiosInstance.post('/messages/mail', payload)
      
      if (data?.success) {
        toast.success(data.message)
      } else {
        toast.error(data?.message || 'Failed to send email')
      }
      return data
    } catch (err) {
      toast.error('Failed to send email')
      return { success: false, message: 'Failed to send email' }
    }
  }
  return sendEmail
}
