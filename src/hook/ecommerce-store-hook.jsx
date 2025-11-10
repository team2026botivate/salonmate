import { useAllProductStore } from '../zustand/ecommerce-store-zustand';
import axios from 'axios';
import { useAuth } from '@/Context/AuthContext';
import { useState } from 'react';
import supabase from '@/dataBase/connectdb';

export const useEcommerceStoreFetchAllProduct = () => {
  const { setAllProduct, setError } = useAllProductStore();
  const { user } = useAuth();

  console.log(user, 'userdetails');

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

  const addToCart = async (product) => {
    const storeId = user?.profile?.store_id;
    try {
      if (!product?.id || !storeId) {
        console.error('❌ Missing product or store ID:', { product, storeId });
        throw new Error('Missing product or store ID');
      }

      setLoading(true);
      setError(null);

      // 1️⃣ Check if product already exists in the cart for this store
      const { data: existing, error: fetchError } = await supabase
        .from('saloon_e_commerce_cart_items')
        .select('id, quantity')
        .eq('product_id', product.id)
        .eq('store_id', storeId)
        .maybeSingle();

      console.log('existing', existing);

      if (fetchError) throw fetchError;

      if (existing) {
        // 2️⃣ Update quantity if product already exists
        const { error: updateError } = await supabase
          .from('saloon_e_commerce_cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // 3️⃣ Insert a new product row into the cart
        const { error: insertError } = await supabase.from('saloon_e_commerce_cart_items').insert([
          {
            product_id: product.id,
            quantity: 1,
            price_snapshot: product.price,
            store_id: storeId,
          },
        ]);

        if (insertError) throw insertError;
      }

      console.log('✅ Product added/updated in cart:', product.name);
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      setError(err.message || 'Failed to add to cart');
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
    console.log('Ram RAm');

    const storeId = user?.profile?.store_id;

    if (!storeId) {
      setError('User is not associated with a store.');
      return; // Can't fetch without a store ID
    }

    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Fetch cart items for the specific store
      // We also fetch related product details using a join.
      // This assumes 'product_id' is a foreign key to a 'products' table.
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
  
        .order('id', { ascending: true }); // Optional: ensures a stable order

      console.log(data, 'data');

      // console.log('data', data);
      if (fetchError) throw fetchError;

      if (data) {
        setCartItems(data);
        // console.log('✅ Cart items fetched:', data);
      }
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      setError(err.message || 'Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  // Return the state and the fetch function
  return { fetchCart, cartItems, loading, error, setCartItems };
};
