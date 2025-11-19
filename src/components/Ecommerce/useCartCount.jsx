import { useEffect, useState, useCallback } from "react";
import supabase from '@/dataBase/connectdb';

export function useCartCount(storeId = null) {
        const [count, setCount] = useState(0);
        
        //Fetch the total count (efficient)
        const fetchCount = useCallback(async () => {
                let query = supabase
                .from('saloon_e_commerce_cart_items')
                .select('*', { head: true, count: 'exact' });
                
                if (storeId) query = query.eq('store_id', storeId).eq('payment_status', 'pending');

                const { count: total, error } = await query;
                if (!error) setCount(total ?? 0);
        }, [storeId]);

        // Subscribe for realtime updates
        useEffect(() => {
                fetchCount();   // initial load

                const channel = supabase
                .channel('cart-count')
                .on(
                        'postgres_changes',
                        {
                                event: '*',
                                schema: 'public',
                                table: 'saloon_e_commerce_cart_items',
                                ...(storeId ? { filter: `store_id=eq.${ storeId }`} : {}),
                        },
                        () => fetchCount()  // re-fetch when cart changes
                )
                .subscribe();

                return () => supabase.removeChannel(channel);
        }, [fetchCount, storeId]);

        return count;
}