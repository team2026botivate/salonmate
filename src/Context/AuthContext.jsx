"use client"

// AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react"

// Create the auth context
const AuthContext = createContext()

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext)
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  // Use state to track the authenticated user
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Staff positions with their corresponding columns
  const staffPositions = [
    { name: "Staff 1", usernameCol: 16, passwordCol: 17, roleCol: 18, permissionCol: 18, columns: "Q/R/S" },
    { name: "Staff 2", usernameCol: 19, passwordCol: 20, roleCol: 21, permissionCol: 21, columns: "T/U/V" },
    { name: "Staff 3", usernameCol: 22, passwordCol: 23, roleCol: 24, permissionCol: 24, columns: "W/X/Y" },
    { name: "Staff 4", usernameCol: 25, passwordCol: 26, roleCol: 27, permissionCol: 27, columns: "Z/AA/AB" }
  ]

  // Update the verifyUserAuthorization function to also check column H for permissions
  const verifyUserAuthorization = async (userId) => {
    try {
      // Initial client sheet details
      const initialSheetId = "1zEik6_I7KhRQOucBhk1FW_67IUEdcSfEHjCaR37aK_U"
      const initialSheetName = "Clients"

      // Fetch the Clients sheet data
      const url = `https://docs.google.com/spreadsheets/d/${initialSheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(initialSheetName)}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch client data: ${response.status}`)
      }

      console.log("Client data fetched successfully",response)
      // Extract the JSON part from the response
      const text = await response.text()
      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}")
      const jsonString = text.substring(jsonStart, jsonEnd + 1)
      const data = JSON.parse(jsonString)

      console.log("Client data parsed successfully",data)
      // Process the client data
      if (!data.table || !data.table.rows) {
        throw new Error("Invalid client data format")
      }

      // Helper function to extract cell value safely
      const extractValue = (row, index) => {
        return row.c && row.c[index] && row.c[index].v !== undefined ? 
          row.c[index].v.toString().trim() : ""
      }

      // Helper function to check authorization and date
      const checkAuthorization = (row) => {
        // Check authorization value in column G (index 6)
        const authValue = row.c[6] && row.c[6].v !== undefined ? 
          Number.parseFloat(row.c[6].v) : 0

        // Check authorization date in column L (index 11)
        const authDateStr = extractValue(row, 11) // Column L for authorization date
        
        if (authValue <= 0) {
          return false
        }

        // If authorization date exists, check if it's still valid
        if (authDateStr) {
          const authDate = new Date(authDateStr)
          const currentDate = new Date()
          
          if (authDate < currentDate) {
            return false
          }
        }

        return true
      }

      // First, check admin credentials (column C)
      for (const row of data.table.rows) {
        const adminUsername = extractValue(row, 2) // Column C
        
        // Check if this is our admin user
        if (adminUsername === userId) {
          // Check authorization
          if (!checkAuthorization(row)) {
            return { isAuthorized: false, permissions: [], sheetId: "", scriptUrl: "" }
          }
          
          // Get Sheet ID and Script URL from columns A and B
          const sheetId = extractValue(row, 0) // Column A for Sheet ID
          const scriptUrl = extractValue(row, 1) // Column B for Script URL
          
          // Check column I (index 8) for role
          const roleValue = extractValue(row, 8) // Column I
          
          // Check column H (index 7) for permissions
          const permissionsValue = extractValue(row, 7) // Column H
          
          // Parse comma-separated permissions list
          const permissions = permissionsValue ? permissionsValue.split(',').map(p => p.trim().toLowerCase()) : []

          // Store the role value from column I in localStorage for later use
          if (roleValue) {
            localStorage.setItem("userColumnIValue", roleValue)
          }
          
          // Store the permissions from column H in localStorage
          if (permissions.length > 0) {
            localStorage.setItem("userPermissions", JSON.stringify(permissions))
          }
          
          // Store the sheet ID and script URL in localStorage
          if (sheetId) {
            localStorage.setItem("userSheetId", sheetId)
          }
          
          if (scriptUrl) {
            localStorage.setItem("userScriptUrl", scriptUrl)
          }

          return { 
            isAuthorized: true, 
            permissions,
            sheetId,
            scriptUrl
          }
        }
      }

      // Then, check for staff users in each staff position
      for (const position of staffPositions) {
        for (const row of data.table.rows) {
          const staffUsername = extractValue(row, position.usernameCol)
          
          // Check if this is our staff user
          if (staffUsername === userId) {
            // Check authorization
            if (!checkAuthorization(row)) {
              return { isAuthorized: false, permissions: [], sheetId: "", scriptUrl: "" }
            }
            
            // Get Sheet ID and Script URL from columns A and B
            const sheetId = extractValue(row, 0) // Column A for Sheet ID
            const scriptUrl = extractValue(row, 1) // Column B for Script URL
            
            // Get role from the role column for this position
            const roleValue = extractValue(row, position.roleCol)
            
            // Get permissions from the permission column for this position
            const permissionsValue = extractValue(row, position.permissionCol)
            
            // Parse comma-separated permissions list
            const permissions = permissionsValue ? permissionsValue.split(',').map(p => p.trim().toLowerCase()) : []

            // Store the role value in localStorage for later use
            if (roleValue) {
              localStorage.setItem("userColumnIValue", roleValue)
            }
            
            // Store the permissions in localStorage
            if (permissions.length > 0) {
              localStorage.setItem("userPermissions", JSON.stringify(permissions))
            }
            
            // Store the staff position in localStorage
            localStorage.setItem("userStaffPosition", position.name)
            
            // Store the sheet ID and script URL in localStorage
            if (sheetId) {
              localStorage.setItem("userSheetId", sheetId)
            }
            
            if (scriptUrl) {
              localStorage.setItem("userScriptUrl", scriptUrl)
            }

            return { 
              isAuthorized: true, 
              permissions,
              sheetId,
              scriptUrl,
              staffPosition: position.name
            }
          }
        }
      }

      // User not found in any position
      return { isAuthorized: false, permissions: [], sheetId: "", scriptUrl: "" }
    } catch (error) {
      console.error("Error verifying user authorization:", error)
      return { isAuthorized: false, permissions: [], sheetId: "", scriptUrl: "" } // Fail closed - if there's an error, don't authorize
    }
  }

  // Check for existing user in localStorage on initial load
  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = localStorage.getItem("salonUser")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)

          // Verify the user's authorization before setting them as logged in
          const { isAuthorized, permissions, sheetId, scriptUrl, staffPosition } = await verifyUserAuthorization(userData.email)

          if (isAuthorized) {
            // User is authorized, proceed with login
            // Add permissions, sheetId, and scriptUrl to the user data
            userData.permissions = permissions
            
            // Update sheetId and scriptUrl if they were found
            if (sheetId) {
              userData.sheetId = sheetId
            }
            
            if (scriptUrl) {
              userData.appScriptUrl = scriptUrl
            }

            // Update staff position if found
            if (staffPosition) {
              userData.staffPosition = staffPosition
            }
            
            setUser(userData)
          } else {
            // User is not authorized, log them out
            logout()

            // Show alert about account not being active
            setTimeout(() => {
              alert("Your account is not active. Please contact administrator.")
              // Redirect to login page - assuming we're using react-router
              window.location.href = "/"
            }, 100)
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error)
          localStorage.removeItem("salonUser")
        }
      }

      setLoading(false)
    }

    loadUserData()
  }, [])

  // Update the login function to include permissions from column H and store sheetId and appScriptUrl
  const login = async (userData) => {
    // Get the column I value from localStorage if it exists
    const columnIValue = localStorage.getItem("userColumnIValue")

    // Get permissions from localStorage if they exist
    const storedPermissions = localStorage.getItem("userPermissions")
    const permissions = storedPermissions ? JSON.parse(storedPermissions) : []

    // Get sheetId and scriptUrl from localStorage if they exist
    const storedSheetId = localStorage.getItem("userSheetId")
    const storedScriptUrl = localStorage.getItem("userScriptUrl")

    // Get staff position from localStorage if it exists
    const storedStaffPosition = localStorage.getItem("userStaffPosition")

    // If column I value is "admin", set role to admin
    if (columnIValue === "admin") {
      userData.role = "admin"
    }

    // Store the column I value and permissions in the user data
    userData.columnIValue = columnIValue || ""
    userData.permissions = permissions

    // Make sure sheetId and appScriptUrl are included in the userData
    // Priority: 1. userData's own values, 2. localStorage values, 3. leave as is
    if (!userData.sheetId && storedSheetId) {
      userData.sheetId = storedSheetId
    }

    if (!userData.appScriptUrl && storedScriptUrl) {
      userData.appScriptUrl = storedScriptUrl
    }

    // Make sure staff position is included if applicable
    if (!userData.staffPosition && storedStaffPosition) {
      userData.staffPosition = storedStaffPosition
    }

    

    setUser(userData)
    localStorage.setItem("salonUser", JSON.stringify(userData))
  }

  // Logout function - clears user from state and localStorage
  const logout = () => {
    setUser(null)
    localStorage.removeItem("salonUser")
    localStorage.removeItem("userColumnIValue")
    localStorage.removeItem("userPermissions")
    localStorage.removeItem("userSheetId")
    localStorage.removeItem("userScriptUrl")
    localStorage.removeItem("userStaffPosition")
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user
  }

  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role
  }

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    return user && 
           user.permissions && 
           (user.permissions.includes(permission.toLowerCase()) || 
            user.permissions.includes('all')) // 'all' is a special permission that grants access to everything
  }

  // Check if user is an admin
  const isAdmin = () => {
    return user && user.role === "admin"
  }

  // Check if user is staff
  const isStaff = () => {
    return user && user.role === "staff"
  }

  // Get staff name
  const getStaffName = () => {
    return user && user.staffName ? user.staffName : ""
  }

  // Get current salon info
  const getSalonInfo = () => {
    if (!user) return null

    return {
      salonId: user.email,
      salonName: user.name,
      sheetId: user.sheetId,
      appScriptUrl: user.appScriptUrl,
    }
  }

  // Value to be provided by the context
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasPermission,
    isAdmin,
    isStaff,
    getStaffName,
    getSalonInfo,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export default AuthContext