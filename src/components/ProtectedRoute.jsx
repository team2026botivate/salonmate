import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/Context/AuthContext'
import { useLicense } from '@/Context/LicenseContext'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle } from 'lucide-react'

const ProtectedRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const { isActive, loading: licenseLoading, planType, daysRemaining } = useLicense()
  const location = useLocation()

  // Show loading state while checking auth and license
  if (authLoading || licenseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Checking license status...</p>
        </motion.div>
      </div>
    )
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // Redirect to auth if license is inactive/expired
  if (!isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              License Expired
            </h2>
            <p className="mb-6 text-gray-600">
              Your {planType} license has expired. Please renew to continue using SalonMate.
            </p>
            <div className="space-y-3">
              <Navigate to="/license" replace />
              <button
                onClick={() => window.location.href = '/auth'}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Go to License Management
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show warning if license is expiring soon (less than 7 days)
  if (isActive && daysRemaining <= 7) {
    return (
      <div className="relative">
        {/* Expiring Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500 px-4 py-2 text-center text-white"
        >
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">
              Your {planType} license expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => window.location.href = '/license'}
              className="ml-4 rounded bg-yellow-600 px-3 py-1 text-xs hover:bg-yellow-700"
            >
              Renew Now
            </button>
          </div>
        </motion.div>
        {children}
      </div>
    )
  }

  // License is active, render protected content
  return children
}

export default ProtectedRoute
