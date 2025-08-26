"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, User, Lock, AlertCircle, ChevronRight } from "lucide-react"
import { useAuth } from "../Context/AuthContext.jsx"
import supabase from "@/dataBase/connectdb.js"

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")


  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin-dashboard")
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      setIsLoading(false)
      return
    }

    try {
      // Supabase sign-in
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log(data?.user)
      console.log(supabaseError)
      if (supabaseError) {
        setError(supabaseError.message)
        setIsLoading(false)
        return
      }

      if (data?.user) {
        // User is logged in successfully
        const userData = {
          email: data.user.email,
          id: data.user.id,
          role: "staff", // optionally fetch from your Supabase table if you have roles
        }

        login(userData) // store user in AuthContext
        navigate("/admin-dashboard", { replace: true })
      } else {
        setError("Login failed. Please try again.")
      }

    } catch (err) {
      console.error("Login error:", err)
      setError("Login failed. Please try again later.")
    }

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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="flex w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Left side - branding (optional) */}
        <motion.div
          variants={fadeIn}
          className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex-col justify-center p-8"
        >
          <motion.h1 variants={fadeIn} className="text-3xl font-bold">Salon Pro</motion.h1>
          <motion.p variants={fadeIn} className="mt-4 text-white/80">Professional Salon Management</motion.p>
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-indigo-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 bg-white/80 disabled:opacity-50 transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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
                  <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                ) : "Sign in"}
                <ChevronRight className="ml-2 h-5 w-5" />
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
