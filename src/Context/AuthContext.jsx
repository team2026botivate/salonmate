import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user data on initial load
  useEffect(() => {
    const checkStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('salon_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Normalize permissions with current defaults for the role
          const role = (userData?.role || 'staff').toLowerCase();
          const defaultPerms = getPermissionsForRole(role);
          const currentPerms = Array.isArray(userData?.permissions) ? userData.permissions : [];
          const mergedPerms = Array.from(new Set([...currentPerms, ...defaultPerms]));

          const normalizedUser = {
            ...userData,
            role,
            permissions: role === 'admin' ? ['all'] : mergedPerms,
          };

          setUser(normalizedUser);
          localStorage.setItem('salon_user', JSON.stringify(normalizedUser));
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
        localStorage.removeItem('salon_user');
      } finally {
        setLoading(false); // End loading regardless of whether error occurred
      }
    };

    checkStoredUser(); // Load the stored user data on mount
  }, []);

  // Helper to compute permissions by role
  const getPermissionsForRole = (role) => {
    const normalizedRole = (role || 'staff').toLowerCase();
    if (normalizedRole === 'admin') {
      return ['all'];
    }
    // Staff: restrict to appointment-related areas by default
    return [
      'appointment', // Booking
      'runningappointment', // DailyEntry / running
      'appointmenthistory', // Appointment History
      'inventory', // Inventory access for staff
      // Add more if staff should see them:
      // 'customers',
      // 'whatsapptemplate',
    ];
  };

  // Login function - stores user data with role-based permissions
  const login = (userData) => {
    const role = userData?.role || 'staff';
    const enhancedUser = {
      ...userData,
      role,
      permissions:
        userData?.permissions && Array.isArray(userData.permissions)
          ? userData.permissions
          : getPermissionsForRole(role),
    };

    setUser(enhancedUser);
    localStorage.setItem('salon_user', JSON.stringify(enhancedUser));
  };

  // Logout function - clears user data
  const logout = () => {
    setUser(null);
    localStorage.removeItem('salon_user');
    localStorage.removeItem('supabase_session');
  };

  const hasPermission = (permission) => {
    if (!permission) return false;
    const perms = user?.permissions || [];
    return perms.includes('all') || perms.includes(permission);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div>Loading...</div> // You can replace this with a spinner or any other loading UI
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
