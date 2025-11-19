import { useAllProductStore } from '../zustand/ecommerce-store-zustand';
import axios from 'axios';
import { useAuth } from '@/Context/AuthContext';
import { useState } from 'react';
import supabase from '@/dataBase/connectdb';

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

export const useAddToCart = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setCartLength } = useAllProductStore.getState
    ? useAllProductStore.getState()
    : { setCartLength: null };

  const addToCart = async (product) => {
    const storeId = user?.profile?.store_id;
    try {
      if (!product?.id || !storeId) {
        console.error('❌ Missing product or store ID:', { product, storeId });
        throw new Error('Missing product or store ID');
      }

      setLoading(true);
      setError(null);

      // Call backend API to perform cart write using server credentials (avoids client RLS issues)
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_API}/store/addToCart`, {
        productId: product.id,
        store_id: storeId,
        price: product.price,
        quantity: 1,
      });

      if (data && data.message) {
        console.log('✅ addToCart:', data.message);
      }

      // Fetch the latest count and update badge immediately
      try {
        const { count: total } = await supabase
          .from('saloon_e_commerce_cart_items')
          .select('*', { head: true, count: 'exact' })
          .eq('store_id', storeId);
        if (typeof total === 'number' && Number.isFinite(total)) {
          // use zustand store directly to avoid prop drilling
          // fallback: window event if store not available
          try {
            const { useEcommerceStore } = await import('../zustand/ecommerce-store-zustand');
            useEcommerceStore.getState().setCartLength(total);
          } catch (_) {}
        }
      } catch (_) {}

      return { success: true };
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      setError(err.message || 'Failed to add to cart');
      return { success: false, error: err.message || 'Failed to add to cart' };
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, loading, error };
};

export const useFetchCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    const storeId = user?.profile?.store_id;

    if (!storeId) {
      setError('User is not associated with a store.');
      return; // Can't fetch without a store ID
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('saloon_e_commerce_cart_items')
        .select(
          `
            id,
            quantity,
            price_snapshot,
            store_id,
            product_id (
              id,
              name,
              price,
              image_url
            )
          `
        )
        .eq('store_id', storeId)
        .eq('payment_status', 'pending')

        .order('id', { ascending: true });
      if (fetchError) throw fetchError;

      if (data) {
        setCartItems(data);
      }
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      setError(err.message || 'Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  return { fetchCart, cartItems, loading, error, setCartItems };
};

export const useNewProductIntoStore = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const add_newProduct_to_store = async (productsWithStore) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_API}/store/save`, {
        store_id: user?.profile?.store_id,
        products: productsWithStore,
      });
      console.log(data, 'res form the api ');
      if (!data.success) throw new Error(data?.message || 'Failed to save');
      // eslint-disable-next-line no-alert
      alert('Products saved successfully');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || 'Error saving products');
    } finally {
      setIsLoading(false);
    }
  };

  return { add_newProduct_to_store, isLoading };
};

export const useEcommerce_store_payment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const ecommerce_payment = async (paymentMethod, amount, storeId, paymentStatus = 'paid') => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/store/ecommerce_payment`,
        {
          paymentMethod,
          amount,
          store_id: storeId,
          payment_status: paymentStatus,
        }
      );

      if (!data.success) throw new Error(data?.message || 'Payment failed');
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message || 'Payment failed' };
    } finally {
      setIsLoading(false);
    }
  };

  return { ecommerce_payment, isLoading };
};
