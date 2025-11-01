import { useAllProductStore } from '../zustand/ecommerce-store-zustand';
import axios from 'axios';
import { useAuth } from '@/Context/AuthContext';

export const useEcommerceStoreFetchAllProduct = () => {
  const { setAllProduct, setError } = useAllProductStore();
  const { user } = useAuth();
  
  const fetchAllProducts = async (page, limit) => {
    try {
      // Ensure valid page and limit
      const validPage = Math.max(1, page || 1);
      const validLimit = Math.max(1, limit || 10);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/store/getProducts?store_id=${user?.profile?.store_id}&page=${validPage}&limit=${validLimit}`
      );

      const { data, headers } = response;
      // Prefer total from headers if API provides it (e.g., X-Total-Count)
      const headerTotal = headers?.['x-total-count'] ? Number(headers['x-total-count']) : undefined;

      // Trust backend response; attach header total if present, but never estimate
      setAllProduct(headerTotal != null ? { ...data, total: headerTotal } : data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error);
    }
  };

  return { fetchAllProducts };
};
