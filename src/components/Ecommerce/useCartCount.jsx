import { useEffect, useState, useCallback } from 'react';
import supabase from '@/dataBase/connectdb';
import { useAuth } from '@/Context/AuthContext';

export function useCartCount(storeId = null) {
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  //Fetch the total count (efficient)
  const fetchCount = useCallback(async () => {
    // Fetch quantities for pending items and sum client-side
    let query = supabase
      .from('saloon_e_commerce_cart_items')
      .select('quantity')
      .eq('payment_status', 'pending');

    if (storeId) query = query.eq('store_id', storeId);
    if (user?.id) query = query.eq('user_id', user.id);

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const totalQty = data.reduce((acc, r) => acc + Number(r?.quantity || 0), 0);
      setCount(totalQty);
    }
  }, [storeId, user?.id]);

  // Subscribe for realtime updates
  useEffect(() => {
    fetchCount(); // initial load

    const channel = supabase
      .channel('cart-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saloon_e_commerce_cart_items',
          ...(storeId ? { filter: `store_id=eq.${storeId}` } : {}),
        },
        () => fetchCount() // re-fetch when cart changes
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchCount, storeId]);

  return count;
}
