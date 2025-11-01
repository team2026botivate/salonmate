import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/dataBase/connectdb';

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

  // Live refresh permissions from Supabase when user/store changes (skip admins)
  useEffect(() => {
    const refreshPermissions = async () => {
      try {
        if (!user?.id || !user?.profile?.store_id) return;
        if (String(user?.role).toLowerCase() === 'admin') return;

        const { data: rows, error } = await supabase
          .from('user_permissions')
          .select('permission_id')
          .eq('user_id', user.id)
          .eq('store_id', user.profile.store_id);
        if (error) return; // silently ignore; existing perms remain

        if (Array.isArray(rows)) {
          const newPerms = rows.map((r) => String(r.permission_id));
          // Only update if changed to avoid loops
          const current = user.permissions || [];
          const same =
            current.length === newPerms.length && current.every((p) => newPerms.includes(p));
          if (!same) {
            const updated = { ...user, permissions: newPerms };
            setUser(updated);
            localStorage.setItem('salon_user', JSON.stringify(updated));
          }
        }
      } catch (_) {
        // noop
      }
    };

    refreshPermissions();
  }, [user?.id, user?.profile?.store_id]);

  // Subscribe to realtime permission changes for this user+store (skip admins)
  useEffect(() => {
    if (!user?.id || !user?.profile?.store_id) return;
    if (String(user?.role).toLowerCase() === 'admin') return;

    const storeId = user.profile.store_id;
    const channel = supabase
      .channel(`user_permissions_${user.id}_${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_permissions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Re-fetch on any change for this user; RLS ensures we only see same-store rows
          (async () => {
            try {
              const { data: rows } = await supabase
                .from('user_permissions')
                .select('permission_id')
                .eq('user_id', user.id)
                .eq('store_id', storeId);
              if (Array.isArray(rows)) {
                const newPerms = rows.map((r) => String(r.permission_id));
                const current = user.permissions || [];
                const same =
                  current.length === newPerms.length && current.every((p) => newPerms.includes(p));
                if (!same) {
                  const updated = { ...user, permissions: newPerms };
                  setUser(updated);
                  localStorage.setItem('salon_user', JSON.stringify(updated));
                }
              }
            } catch (_) {}
          })();
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (_) {}
    };
  }, [user?.id, user?.profile?.store_id]);

  // Helper to compute permissions by role
  const getPermissionsForRole = (role) => {
    const normalizedRole = (role || 'staff').toLowerCase();
    if (normalizedRole === 'admin') {
      return ['all'];
    }
    return [
      'appointment', // Booking
      'runningappointment', // DailyEntry / running
      'appointmenthistory', // Appointment History
      'inventory', // Inventory access for staff
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
        <div></div> // You can replace this with a spinner or any other loading UI
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
