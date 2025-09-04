import React, { useEffect, useState } from 'react'
import { useAuth } from '@/Context/AuthContext'
import { checkLicenseByStoreId } from '@/utils/chekcLicence'
import { useNavigate, Outlet } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useLicense } from '@/zustand/license'
import { X } from 'lucide-react'
import { useAppData } from '@/zustand/appData'

// Reusable UI to show license inactive/expired notice
export const LicenseNotice = ({ reason = 'Your license is not active', onClose }) => {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <X
        className="absolute top-10 right-10 cursor-pointer"
        onClick={onClose ? onClose : () => navigate('/auth')}
      />
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
        <div className="mb-4 text-6xl text-red-500">🚫</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-800">License Required</h2>
        <p className="mb-4 text-gray-600">{reason}</p>
        <div className="relative space-y-3">
          <a
            href="mailto:team1.interns@botivate.in?subject=License Renewal&body=Please help me renew my license."
            className="inline-block w-full rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:cursor-pointer hover:bg-red-700"
          >
            Renew License
          </a>
          <p className="text-sm text-gray-500">Please contact support to renew your license</p>
        </div>
      </div>
    </div>
  )
}

const LicenseGuard = ({ children }) => {
  const { user, logout } = useAuth()
  const { licenseData, setLicenseData } = useLicense((state) => state)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const storeIdFromState = useAppData((state) => state.store_id)

  useEffect(() => {
    const checkUserLicense = async () => {
      // Prefer store_id from Zustand, fallback to user.profile.store_id
      const effectiveStoreId = storeIdFromState || user?.profile?.store_id

      if (effectiveStoreId) {
        try {
          const data = await checkLicenseByStoreId(effectiveStoreId)
          setLicenseData(data)

          if (!data.active) {
            toast.error(
              `License ${data.reason || 'is not active'}. Please renew your license.`
            )
          }
        } catch (error) {
          console.error('License check failed:', error)
          setLicenseData({ active: false, reason: 'License check failed' })
        } finally {
          setLoading(false)
        }
      } else {
        // If we don't have a store id yet, don't block; allow app to proceed
        setLoading(false)
      }
    }

    checkUserLicense()
  }, [user, storeIdFromState])

  // Show loading while checking license
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Block access if license is not active
  if (licenseData && !licenseData.active) {
    return <LicenseNotice reason={licenseData.reason || 'Your license is not active'} />
  }

  // Render children if license is active
  return <>{children ? children : <Outlet />}</>
}

export default LicenseGuard
