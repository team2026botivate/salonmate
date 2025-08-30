import { create } from 'zustand'

export const useLicense = create((set) => ({
  licenseKey: '',
  expirationDate: '',
  isActive: false,
  setLicenseKey: (licenseKey) => set({ licenseKey }),
  setExpirationDate: (expirationDate) => set({ expirationDate }),
  setIsActive: (isActive) => set({ isActive }),
}))
