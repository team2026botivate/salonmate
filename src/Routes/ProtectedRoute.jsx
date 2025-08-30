import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { useLicense } from '@/zustand/license'

const ProtectedRoute = ({ redirectPath = '/auth', children }) => {
  const { user, loading } = useAuth()
  const { licenseData } = useLicense()
  
 

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle />
      </div>
    )
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <Navigate to={redirectPath} replace />
  }

  // If authenticated but license is expired/inactive, redirect to /auth
  if (licenseData && !licenseData.active) {
    return <Navigate to={redirectPath} replace />
  }

  // For authenticated users with expired licenses, allow them through
  // LicenseGuard will handle showing the license renewal screen
  // This prevents the infinite redirect loop between /auth and dashboard
  
  // Render children or outlet if authenticated
  return children ? children : <Outlet />
}

export default ProtectedRoute
