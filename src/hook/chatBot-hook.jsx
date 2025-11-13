import axios from 'axios';
import { useAuth } from '@/Context/AuthContext';
export const useChatBot = () => {
  const { user } = useAuth();
  const doChat_with_Bot = async (userMessage) => {
    const payload = {
      query: userMessage,
      store_id: user?.profile?.store_id,
    };
    // Make API call to backend
    const response = await axios.post(
      `${import.meta.env.VITE_AI_AGENT_HOSTING_URL}/chat`,
      payload
    );

    return response.data;
  };
  return doChat_with_Bot;
};
