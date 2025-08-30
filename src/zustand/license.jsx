import { create } from 'zustand'

export const useLicense = create((set) => ({
  licenseData: null, // Default value
  setLicenseData: (data) => set({ licenseData: data }), // Update function
  clearLicenseData: () => set({ licenseData: null }), // Clear data if needed
}))
