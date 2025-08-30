import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { LoaderCircle } from 'lucide-react'

const ProtectedRoute = ({ redirectPath = '/auth', children }) => {
  const { user, loading } = useAuth()

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle />
      </div>
    )
  }
  
  // Redirect to auth page if not authenticated
  if (!user) {
    return <Navigate to={redirectPath} replace />
  }
  
  // Render children or outlet if authenticated
  return children ? children : <Outlet />
}

export default ProtectedRoute