import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppData = create(
  persist(
    (set) => ({
      appointments: [],
      setAppointments: (appointments) => set({ appointments }),

      refreshAppointments: false, // this is for appointments
      refreshExtraServicesHookRefresh: false, // this is for extra services
      refreshTransactionHookRefresh: false, // this is for transactions

      // Store ID management for multi-user functionality
      store_id: null,
      setStoreId: (store_id) => set({ store_id }),
      clearStoreId: () => set({ store_id: null }),

      setRefreshTransactionHookRefresh: () =>
        set((state) => ({
          refreshTransactionHookRefresh: !state.refreshTransactionHookRefresh,
        })),

      setRefreshExtraServicesHookRefresh: () =>
        set((state) => ({
          refreshExtraServicesHookRefresh: !state.refreshExtraServicesHookRefresh,
        })),

      setRefreshAppointments: () =>
        set((state) => ({
          refreshAppointments: !state.refreshAppointments,
        })),
    }),
    {
      name: "app-storage", // localStorage key
      partialize: (state) => ({
        appointments: state.appointments,
        store_id: state.store_id,
      }), 
    }
  )
);
