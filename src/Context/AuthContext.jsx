import { CircleParkingOff, CloudLightning } from 'lucide-react'
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  console.log(user,"form context")

  // Check for stored user data on initial load
  useEffect(() => {
    const checkStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('salon_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error loading stored user:', error)
        localStorage.removeItem('salon_user')
      } finally {
        setLoading(false)
      }
    }

    checkStoredUser()
  }, [])

  // Login function - just stores user data
  const login = (userData) => {
    const enhancedUser = {
      ...userData,
      role: userData.role || 'staff',
      permissions: ['all'] // Default permissions
    }
    
    setUser(enhancedUser)
    localStorage.setItem('salon_user', JSON.stringify(enhancedUser))
  }

  // Logout function - clears user data
  const logout = () => {
    setUser(null)
    localStorage.removeItem('salon_user')
    localStorage.removeItem('supabase_session')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}