import { create } from 'zustand'

export const useAppData = create((set) => ({
  appointments: [],
  setAppointments: (appointments) => set({ appointments }),
  refreshAppointments: false, // this is for appointments
  refreshExtraServicesHookRefresh: false, // this is for extra services
  refreshTransactionHookRefresh: false, // this is for transactions
  setRefreshTransactionHookRefresh: () =>
    set((state) => ({
      refreshTransactionHookRefresh: !state.refreshTransactionHookRefresh,
    })),
  setRefreshExtraServicesHookRefresh: () =>
    set((state) => ({
      refreshExtraServicesHookRefresh: !state.refreshExtraServicesHookRefresh,
    })),
  setRefreshAppointments: () =>
    set((state) => ({ refreshAppointments: !state.refreshAppointments })),
}))
