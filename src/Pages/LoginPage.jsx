"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, User, Lock, AlertCircle, X, Scissors, Calendar, ChevronRight } from "lucide-react"
import { useAuth } from "../Context/AuthContext.jsx"

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, logout, isAuthenticated, user } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [matchedClient, setMatchedClient] = useState(null)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin-dashboard")
    }
  }, [isAuthenticated, navigate])

  // Initial client sheet details
  const initialSheetId = "1zEik6_I7KhRQOucBhk1FW_67IUEdcSfEHjCaR37aK_U"
  const initialSheetName = "Clients"
  const initialScriptUrl =
    "https://script.google.com/macros/s/AKfycbz6-tMsYOC4lbu4XueMyMLccUryF9HkY7HZLC22FB9QeB5NxqCcxedWKS8drwgVwlM/exec"

  // Staff positions with their corresponding columns
  const staffPositions = [
    { name: "Staff 1", usernameCol: 16, passwordCol: 17, roleCol: 18, permissionCol: 18, columns: "Q/R/S" },
    { name: "Staff 2", usernameCol: 19, passwordCol: 20, roleCol: 21, permissionCol: 21, columns: "T/U/V" },
    { name: "Staff 3", usernameCol: 22, passwordCol: 23, roleCol: 24, permissionCol: 24, columns: "W/X/Y" },
    { name: "Staff 4", usernameCol: 25, passwordCol: 26, roleCol: 27, permissionCol: 27, columns: "Z/AA/AB" }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate input
      if (!email || !password) {
        setError("Please enter both email and password")
        setIsLoading(false)
        return
      }

      // Fetch the Clients sheet data
      const url = `https://docs.google.com/spreadsheets/d/${initialSheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(initialSheetName)}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }

      // Extract the JSON part from the response
      const text = await response.text()
      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}")
      const jsonString = text.substring(jsonStart, jsonEnd + 1)
      const data = JSON.parse(jsonString)

      // Process the client data
      if (!data.table || !data.table.rows) {
        throw new Error("Invalid client data format")
      }
      
      let foundMatch = false
      let matchedClient = null
      let userRole = "staff"
      let userPermissions = []
      
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
          console.log("Authorization value is 0 or negative")
          return false
        }

        // If authorization date exists, check if it's still valid
        if (authDateStr) {
          const authDate = new Date(authDateStr)
          const currentDate = new Date()
          
          if (authDate < currentDate) {
            console.log("Authorization has expired")
            return false
          }
        }

        return true
      }

      // First, check admin credentials (columns C, D, H)
      const adminRow = data.table.rows.find(row => {
        const adminUsername = extractValue(row, 2) // Column C
        const adminPassword = extractValue(row, 3) // Column D
        return adminUsername === email && adminPassword === password
      })

      if (adminRow) {
        // Validate admin authorization
        if (!checkAuthorization(adminRow)) {
          setError("Your admin access has been revoked or expired.")
          setIsLoading(false)
          return
        }

        // Get Sheet ID and Script URL from columns A and B
        const clientSheetId = extractValue(adminRow, 0) // Column A for Sheet ID
        const clientScriptUrl = extractValue(adminRow, 1) // Column B for Script URL
        
        // Admin login
        const adminUsername = extractValue(adminRow, 2)
        const adminPassword = extractValue(adminRow, 3)
        const adminPermissions = extractValue(adminRow, 7) // Column H
        const adminType = extractValue(adminRow, 8) // Column I

        foundMatch = true
        userRole = adminType === "admin" ? "admin" : "staff"
        matchedClient = {
          sheetId: clientSheetId || initialSheetId, // Use the client's Sheet ID or fall back to the default
          scriptUrl: clientScriptUrl || initialScriptUrl, // Use the client's Script URL or fall back to the default
          username: adminUsername,
          password: adminPassword,
          permissionsValue: adminPermissions,
          columnIValue: adminType
        }
        userPermissions = adminPermissions ? 
          adminPermissions.split(',').map(p => p.trim().toLowerCase()) : []
      } 
      else {
        // Check staff credentials in multiple positions
        for (const position of staffPositions) {
          const staffRow = data.table.rows.find(row => {
            const staffUsername = extractValue(row, position.usernameCol)
            const staffPassword = extractValue(row, position.passwordCol)
            return staffUsername === email && staffPassword === password
          })

          if (staffRow) {
            // Validate staff authorization
            if (!checkAuthorization(staffRow)) {
              setError("Your staff access has been revoked or expired.")
              setIsLoading(false)
              return
            }

            // Get Sheet ID and Script URL from columns A and B
            const clientSheetId = extractValue(staffRow, 0) // Column A for Sheet ID
            const clientScriptUrl = extractValue(staffRow, 1) // Column B for Script URL

            const staffUsername = extractValue(staffRow, position.usernameCol)
            const staffPassword = extractValue(staffRow, position.passwordCol)
            const staffPermissions = extractValue(staffRow, position.roleCol)
            const staffType = extractValue(staffRow, position.roleCol)

            foundMatch = true
            userRole = staffType === "admin" ? "admin" : "staff"
            matchedClient = {
              sheetId: clientSheetId || initialSheetId, // Use the client's Sheet ID or fall back to the default
              scriptUrl: clientScriptUrl || initialScriptUrl, // Use the client's Script URL or fall back to the default
              username: staffUsername,
              password: staffPassword,
              permissionsValue: staffPermissions,
              columnIValue: staffType,
              staffPosition: position.name
            }
            userPermissions = staffPermissions ? 
              staffPermissions.split(',').map(p => p.trim().toLowerCase()) : []
            break
          }
        }
      }

      if (foundMatch && matchedClient) {
        // Store permissions in localStorage
        localStorage.setItem("userPermissions", JSON.stringify(userPermissions))

        // Proceed with login
        proceedWithLogin(
          {
            id: matchedClient.username,
            role: userRole,
            columnIValue: matchedClient.columnIValue || "",
            permissions: userPermissions,
            staffPosition: matchedClient.staffPosition || ""
          },
          matchedClient.sheetId,
          matchedClient.scriptUrl
        )
      } else {
        // No matching credentials found
        setError("Invalid email or password")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Login failed. Please try again later.")
      setIsLoading(false)
    }
  }

  // Update the proceedWithLogin function to include sheetId and scriptUrl
  const proceedWithLogin = (userMatch, sheetId, scriptUrl) => {
    // Determine the role
    let userRole = "staff" // Default role

    // Check if user is admin
    if (userMatch?.columnIValue === "admin") {
      userRole = "admin"
    }

    // Get the user ID (email or username)
    const userId = userMatch?.id || email

    // Extract name part if it's an email
    const userName = userId.split("@")[0]

    // Create user object with ALL required properties
    const userData = {
      email: userId,
      name: userName,
      role: userRole,
      staffName: userName,
      columnIValue: userMatch?.columnIValue || "",
      permissions: userMatch?.permissions || [],
      staffPosition: userMatch?.staffPosition || "",
      sheetId: sheetId, // Add sheetId to user data
      appScriptUrl: scriptUrl // Add scriptUrl to user data
    }

    // Add debug output
    console.log("User data being passed to login:", userData)
    console.log("Using Sheet ID:", sheetId)
    console.log("Using Script URL:", scriptUrl)
    console.log("User permissions:", userData.permissions)

    // Log the user in with sheet data
    login(userData)

    // Navigate to the appropriate dashboard with a small delay
    setTimeout(() => {
      navigate("/admin-dashboard", { replace: true })
    }, 100)

    setIsLoading(false)
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    },
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-gradient-to-r from-blue-200 to-cyan-200 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 opacity-20 blur-3xl"></div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="flex w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Left side - Image and branding */}
        <motion.div
          variants={fadeIn}
          className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex-col justify-between relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border-4 border-white/30"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full border-4 border-white/20"></div>
            <div className="absolute top-3/4 left-1/3 w-24 h-24 rounded-full border-4 border-white/10"></div>
          </div>

          <div className="p-8 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center space-x-2"
            >
              <Scissors className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Salon Pro</h1>
            </motion.div>
          </div>

          <motion.div variants={floatingAnimation} initial="initial" animate="animate" className="relative z-10 p-8">
            <h2 className="text-2xl font-bold mb-5">Professional Salon Management</h2>
            <p className="text-white/80 mb-6">
              Streamline your salon operations with our comprehensive management solution.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Calendar className="h-5 w-5" />
                </div>
                <p>Appointment scheduling</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <User className="h-5 w-5" />
                </div>
                <p>Client management</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Scissors className="h-5 w-5" />
                </div>
                <p>Service tracking</p>
              </div>
            </div>
          </motion.div>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-900/50 to-transparent"></div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div variants={fadeIn} className="w-full md:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your salon dashboard</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start"
                >
                  <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={fadeIn} className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email or ID
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-indigo-500" />
                  </div>
                  <input
                    id="email"
                    type="text"
                    placeholder="Enter your ID or email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 bg-white/80 disabled:opacity-50 transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-indigo-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 bg-white/80 disabled:opacity-50 transition-all duration-200"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                variants={fadeIn}
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage