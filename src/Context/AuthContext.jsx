import { createContext, useContext, useEffect, useState } from 'react'
import supabase from '@/dataBase/connectdb'

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

  // Enhanced user object with permissions and role
  const enhanceUserData = async (supabaseUser) => {
    if (!supabaseUser) return null

    try {
      // Get user profile from Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      // Create enhanced user object
      const enhancedUser = {
        ...supabaseUser,
        role: profile?.role || 'staff',
        permissions: ['all'], // Default permissions for now - you can customize this
        profile: profile
      }

      return enhancedUser
    } catch (error) {
      console.error('Error enhancing user data:', error)
      // Return basic user with default permissions
      return {
        ...supabaseUser,
        role: 'staff',
        permissions: ['all']
      }
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error.message)
        }
        
        if (mounted) {
          if (session?.user) {
            // Store session token in localStorage
            localStorage.setItem('supabase_session', JSON.stringify(session))
            const enhancedUser = await enhanceUserData(session.user)
            setUser(enhancedUser)
          } else {
            // Check for stored session
            const storedSession = localStorage.getItem('supabase_session')
            if (storedSession) {
              try {
                const parsedSession = JSON.parse(storedSession)
                // Validate if session is still valid
                if (parsedSession.expires_at && new Date(parsedSession.expires_at * 1000) > new Date()) {
                  const enhancedUser = await enhanceUserData(parsedSession.user)
                  setUser(enhancedUser)
                } else {
                  localStorage.removeItem('supabase_session')
                  setUser(null)
                }
              } catch {
                localStorage.removeItem('supabase_session')
                setUser(null)
              }
            } else {
              setUser(null)
            }
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Session fetch error:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          if (session?.user) {
            // Store session token in localStorage
            localStorage.setItem('supabase_session', JSON.stringify(session))
            const enhancedUser = await enhanceUserData(session.user)
            setUser(enhancedUser)
          } else {
            // Clear session from localStorage
            localStorage.removeItem('supabase_session')
            setUser(null)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {

    console.log("this is working ")
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log(data,"while login this is going the ")
    console.log(error,"while login this is going the "
      
    )
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      // Clear localStorage regardless of Supabase response
      localStorage.removeItem('supabase_session')
      
      if (error) throw error
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}