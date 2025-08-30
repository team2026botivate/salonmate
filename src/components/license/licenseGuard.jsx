import React, { useEffect, useState } from 'react'
import { useAuth } from '@/Context/AuthContext'
import { checkLicense } from '@/utils/chekcLicence'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const LicenseGuard = ({children}) => {
  const { user, logout } = useAuth()
  const [licenseStatus, setLicenseStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
    
  useEffect(() => {
    const checkUserLicense = async () => {
      if (user?.id) {
        try {
          const data = await checkLicense(user.id)
          console.log(data, 'license data')
          setLicenseStatus(data)
          
          if (!data.active) {
            toast.error(`License ${data.reason || 'is not active'}. Please renew your license.`)
          }
        } catch (error) {
          console.error('License check failed:', error)
          setLicenseStatus({ active: false, reason: 'License check failed' })
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Block access if license is not active
  if (licenseStatus && !licenseStatus.active) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">License Required</h2>
          <p className="text-gray-600 mb-4">
            {licenseStatus.reason || 'Your license is not active'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                logout()
                navigate('/auth')
              }}
              className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout & Login Again
            </button>
            <p className="text-sm text-gray-500">
              Please contact support to renew your license
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render children if license is active
  return <>{children}</>
}

export default LicenseGuard