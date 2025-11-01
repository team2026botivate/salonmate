import { create } from 'zustand';

export const useEcommerceStore = create((set) => ({
  cartLength: 0,
  setCartLength: (cartLength) => set({ cartLength }),
}));

export const useAllProductStore = create((set) => ({
  allProduct: [],
  setAllProduct: (allProduct) => set({ allProduct }),
  error: null,
  setError: (error) => set({ error }),
}));
