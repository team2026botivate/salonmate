import supabase from '@/dataBase/connectdb';
import { useState, useCallback } from 'react';

export const useCartOperations = (storeId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get cart count
  const getCartCount = useCallback(async () => {
    if (!storeId) return 0;
    
    const { count } = await supabase
      .from('saloon_e_commerce_cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);
    
    return count || 0;
  }, [storeId]);

  // Fetch cart items with product details
  const fetchCartItems = useCallback(async () => {
    if (!storeId) return { data: [], error: 'Store ID required' };
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('saloon_e_commerce_cart_items')
        .select(`
          id,
          product_id,
          quantity,
          price_snapshot,
          created_at,
          products:product_id (
            id,
            name,
            description,
            price,
            image_url,
            is_active
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match your cart structure
      const transformedData = data.map(item => ({
        id: item.id,
        productId: item.product_id,
        name: item.products?.name || 'Unknown Product',
        variant: item.products?.description || '',
        price: parseFloat(item.price_snapshot || item.products?.price || 0),
        quantity: item.quantity,
        image: item.products?.image_url || '/placeholder.png',
        isActive: item.products?.is_active
      }));

      return { data: transformedData, error: null };
    } catch (err) {
      setError(err.message);
      return { data: [], error: err.message };
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Update cart item quantity
  const updateCartQuantity = useCallback(async (cartItemId, newQuantity) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('saloon_e_commerce_cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId)
        .eq('store_id', storeId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Remove cart item
  const removeCartItem = useCallback(async (cartItemId) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('saloon_e_commerce_cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('store_id', storeId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  return {
    fetchCartItems,
    updateCartQuantity,
    removeCartItem,
    getCartCount,
    loading,
    error
  };
};