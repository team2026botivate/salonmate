import React, { useEffect, useState } from 'react'
import { useAuth } from '@/Context/AuthContext'
import { checkLicense } from '@/utils/chekcLicence'
import { useNavigate, Outlet } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useLicense } from '@/zustand/license'

const LicenseGuard = ({ children }) => {
  const { user, logout } = useAuth()
  const { licenseData, setLicenseData } = useLicense((state) => state)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUserLicense = async () => {
      if (user?.id) {
        try {
          const data = await checkLicense(user.id)
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
        setLoading(false)
      }
    }

    checkUserLicense()
  }, [user])

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <div className="mb-4 text-6xl text-red-500">🚫</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            License Required
          </h2>
          <p className="mb-4 text-gray-600">
            {licenseData.reason || 'Your license is not active'}
          </p>
          <div className="relative space-y-3">
            <a
              href="mailto:team1.interns@botivate.in?subject=License Renewal&body=Please help me renew my license."
              className="inline-block w-full rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:cursor-pointer hover:bg-red-700"
            >
              Renew License
            </a>
            <p className="text-sm text-gray-500">
              Please contact support to renew your license
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render children if license is active
  return <>{children ? children : <Outlet />}</>
}

export default LicenseGuard
