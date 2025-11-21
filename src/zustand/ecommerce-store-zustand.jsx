import { create } from 'zustand';

export const useEcommerceStore = create((set) => ({
  cartLength: 0,
  
  setCartLength: (next) =>
    set((state) => ({
      cartLength:
        typeof next === 'function' ? Math.max(0, next(state.cartLength)) : Math.max(0, next),
    })),
}));

export const useAllProductStore = create((set) => ({
  allProduct: [],
  setAllProduct: (allProduct) => set({ allProduct }),
  error: null,
  setError: (error) => set({ error }),
}));
